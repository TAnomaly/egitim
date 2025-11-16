import init, { Ros2Simulator } from './pkg/ros2_wasm_interactive.js';

let simulator;
let canvas;
let ctx;
let robots = [];
let obstacles = [];
let topics = [];
let messages = [];
let selectedRobot = null;
let draggedRobot = null;
let obstacleMode = false;
let showGrid = true;
let animationId = null;

// Initialize WASM module and setup
async function setup() {
    await init();
    simulator = new Ros2Simulator();

    canvas = document.getElementById('simCanvas');
    ctx = canvas.getContext('2d');

    // Setup event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleCanvasClick);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);

    // Velocity sliders
    document.getElementById('linearVel').addEventListener('input', updateVelocityFromSliders);
    document.getElementById('angularVel').addEventListener('input', updateVelocityFromSliders);

    console.log('🚀 ROS2 Simulator initialized!');

    // Start animation loop
    animate();
    updateStats();
}

// Animation loop
function animate() {
    simulator.update_robots(Date.now());
    updateRobotsFromSimulator();
    drawSimulation();
    animationId = requestAnimationFrame(animate);
}

// Add robot
window.addRobot = function() {
    const name = document.getElementById('robotName').value;
    const type = document.getElementById('robotType').value;

    if (!name) {
        alert('Lütfen robot ismi girin!');
        return;
    }

    const x = canvas.width / 2 + (Math.random() - 0.5) * 200;
    const y = canvas.height / 2 + (Math.random() - 0.5) * 200;

    simulator.add_robot(name, type, x, y);
    updateRobotsList();
    updateStats();

    document.getElementById('robotName').value = '';
    console.log(`✅ Robot added: ${name} (${type})`);
}

// Add topic
window.addTopic = function() {
    const name = document.getElementById('topicName').value;
    const msgType = document.getElementById('msgType').value;

    if (!name) {
        alert('Lütfen topic ismi girin!');
        return;
    }

    simulator.add_topic(name, msgType);
    updateTopicsList();
    updateStats();

    document.getElementById('topicName').value = '';
    console.log(`✅ Topic added: ${name}`);
}

// Send message (simplified - no JSON required!)
window.sendMessage = function() {
    const topicName = document.getElementById('sendTopic').value;
    const data = document.getElementById('messageData').value;

    if (!topicName || !data) {
        alert('Lütfen topic ve mesaj girin!');
        return;
    }

    const timestamp = Date.now();
    simulator.send_message(topicName, data, timestamp);

    // Add to monitor
    const monitor = document.getElementById('messageMonitor');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.innerHTML = `
        <strong>[${new Date(timestamp).toLocaleTimeString()}]</strong>
        <span style="color: #00bcd4">${topicName}</span>: ${data}
    `;
    monitor.insertBefore(messageDiv, monitor.firstChild);

    // Keep last 30 messages
    while (monitor.children.length > 30) {
        monitor.removeChild(monitor.lastChild);
    }

    updateStats();
    console.log(`📨 Message sent: ${topicName} -> ${data}`);
}

// Set velocity using keyboard
window.setVelocity = function(linear, angular) {
    const robotName = document.getElementById('controlRobot').value;
    if (!robotName) {
        // Select first robot if available
        if (robots.length > 0) {
            document.getElementById('controlRobot').value = robots[0].name;
            simulator.set_robot_velocity(robots[0].name, linear, angular);
        } else {
            alert('Önce robot ekleyin!');
            return;
        }
    } else {
        simulator.set_robot_velocity(robotName, linear, angular);
    }

    // Update sliders
    document.getElementById('linearVel').value = linear;
    document.getElementById('angularVel').value = angular;
    document.getElementById('linearVelValue').textContent = linear;
    document.getElementById('angularVelValue').textContent = angular.toFixed(1);
}

// Update velocity from sliders
function updateVelocityFromSliders() {
    const linear = parseFloat(document.getElementById('linearVel').value);
    const angular = parseFloat(document.getElementById('angularVel').value);
    const robotName = document.getElementById('controlRobot').value;

    document.getElementById('linearVelValue').textContent = linear;
    document.getElementById('angularVelValue').textContent = angular.toFixed(1);

    if (robotName) {
        simulator.set_robot_velocity(robotName, linear, angular);
    }
}

// Keyboard controls
function handleKeyDown(e) {
    // Only if no input is focused
    if (document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA') {
        return;
    }

    switch(e.key.toLowerCase()) {
        case 'w': setVelocity(50, 0); break;
        case 'x': setVelocity(-50, 0); break;
        case 'a': setVelocity(0, 1); break;
        case 'd': setVelocity(0, -1); break;
        case 's': setVelocity(0, 0); break;
    }
}

// Obstacle mode
window.addObstacleMode = function() {
    obstacleMode = !obstacleMode;
    document.getElementById('simMode').textContent = obstacleMode ?
        'Mode: Engel Ekleme (Canvas\'a tıklayın)' : 'Mode: Normal';
}

window.toggleGrid = function() {
    showGrid = !showGrid;
}

window.clearObstacles = function() {
    obstacles = [];
    simulator.reset();
    // Re-add robots
    const robotsJson = simulator.get_robots_json();
    robots = JSON.parse(robotsJson);
    updateStats();
}

window.clearMessages = function() {
    document.getElementById('messageMonitor').innerHTML = '';
    simulator.clear_messages();
    updateStats();
}

window.resetSimulator = function() {
    if (confirm('Tüm simülasyonu sıfırlamak istediğinize emin misiniz?')) {
        simulator.reset();
        robots = [];
        obstacles = [];
        topics = [];
        messages = [];
        document.getElementById('messageMonitor').innerHTML = '';
        updateRobotsList();
        updateTopicsList();
        updateStats();
        console.log('🔄 Simulator reset');
    }
}

// Update lists
function updateRobotsList() {
    const robotsJson = simulator.get_robots_json();
    robots = JSON.parse(robotsJson);

    const select = document.getElementById('controlRobot');
    const currentValue = select.value;
    select.innerHTML = '<option value="">Robot Seç...</option>';

    robots.forEach(robot => {
        const option = document.createElement('option');
        option.value = robot.name;
        option.textContent = `${robot.name} (${robot.robot_type})`;
        select.appendChild(option);
    });

    if (currentValue) {
        select.value = currentValue;
    }
}

function updateTopicsList() {
    const topicsJson = simulator.get_topics_json();
    topics = JSON.parse(topicsJson);

    const select = document.getElementById('sendTopic');
    select.innerHTML = '<option value="">Topic Seç...</option>';

    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.name;
        option.textContent = `${topic.name} (${topic.msg_type})`;
        select.appendChild(option);
    });
}

function updateStats() {
    document.getElementById('robotCount').textContent = simulator.get_robot_count();
    document.getElementById('topicCount').textContent = simulator.get_topic_count();

    const messagesJson = simulator.get_messages_json();
    const msgs = JSON.parse(messagesJson);
    document.getElementById('messageCount').textContent = msgs.length;
}

function updateRobotsFromSimulator() {
    const robotsJson = simulator.get_robots_json();
    robots = JSON.parse(robotsJson);

    const obstaclesJson = simulator.get_obstacles_json();
    obstacles = JSON.parse(obstaclesJson);
}

// Drawing functions
function drawSimulation() {
    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
        drawGrid();
    }

    // Draw obstacles
    obstacles.forEach(obs => {
        drawObstacle(obs);
    });

    // Draw robots
    robots.forEach(robot => {
        drawRobot(robot);
    });
}

function drawGrid() {
    const gridSize = 50;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '10px monospace';
    for (let x = 0; x < canvas.width; x += gridSize * 2) {
        ctx.fillText(x, x + 2, 12);
    }
    for (let y = 0; y < canvas.height; y += gridSize * 2) {
        ctx.fillText(y, 2, y + 10);
    }
}

function drawRobot(robot) {
    ctx.save();
    ctx.translate(robot.x, robot.y);
    ctx.rotate(robot.theta);

    // Robot body colors
    const colors = {
        turtlebot: '#4CAF50',
        differential: '#2196F3',
        ackermann: '#FF9800'
    };
    const color = colors[robot.robot_type] || '#666';

    // Draw robot body
    ctx.fillStyle = color;
    ctx.fillRect(-robot.width/2, -robot.height/2, robot.width, robot.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-robot.width/2, -robot.height/2, robot.width, robot.height);

    // Draw direction indicator
    ctx.beginPath();
    ctx.moveTo(robot.width/2, 0);
    ctx.lineTo(robot.width/2 + 15, 0);
    ctx.strokeStyle = '#ff0';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw wheels for turtlebot
    if (robot.robot_type === 'turtlebot') {
        ctx.fillStyle = '#333';
        ctx.fillRect(-robot.width/2 - 5, -robot.height/2 + 5, 5, 10);
        ctx.fillRect(-robot.width/2 - 5, robot.height/2 - 15, 5, 10);
        ctx.fillRect(robot.width/2, -robot.height/2 + 5, 5, 10);
        ctx.fillRect(robot.width/2, robot.height/2 - 15, 5, 10);
    }

    ctx.restore();

    // Draw robot name and info
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(robot.name, robot.x, robot.y - robot.height/2 - 10);

    // Draw velocity info
    ctx.font = '10px monospace';
    ctx.fillStyle = '#0ff';
    ctx.fillText(`v:${robot.linear_vel.toFixed(0)} ω:${robot.angular_vel.toFixed(1)}`,
                 robot.x, robot.y + robot.height/2 + 20);
}

function drawObstacle(obs) {
    if (obs.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.width/2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244, 67, 54, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        ctx.fillStyle = 'rgba(244, 67, 54, 0.5)';
        ctx.fillRect(obs.x - obs.width/2, obs.y - obs.height/2, obs.width, obs.height);
        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x - obs.width/2, obs.y - obs.height/2, obs.width, obs.height);
    }
}

// Mouse handlers
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a robot
    robots.forEach(robot => {
        const dx = x - robot.x;
        const dy = y - robot.y;
        if (Math.abs(dx) < robot.width/2 && Math.abs(dy) < robot.height/2) {
            draggedRobot = robot;
        }
    });
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update mouse position display
    document.getElementById('mousePos').textContent = `Mouse: (${Math.floor(x)}, ${Math.floor(y)})`;

    if (draggedRobot) {
        simulator.add_robot(draggedRobot.name, draggedRobot.robot_type, x, y);
    }
}

function handleMouseUp() {
    draggedRobot = null;
}

function handleCanvasClick(e) {
    if (!obstacleMode) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const shape = document.getElementById('obstacleShape').value;
    const size = 60;

    simulator.add_obstacle(x, y, size, size, shape);
    updateRobotsFromSimulator();

    console.log(`🧱 Obstacle added at (${Math.floor(x)}, ${Math.floor(y)})`);
}

// Start the application
setup();
