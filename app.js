import init, { Ros2Simulator } from './pkg/ros2_wasm_interactive.js';

const ACTION_PRESETS = {
    forward: { label: 'İleri', helper: 'Linear ileri hareket', key: 'W' },
    backward: { label: 'Geri', helper: 'Linear geri hareket', key: 'X' },
    left: { label: 'Sola Dön', helper: 'Pozitif açı', key: 'A' },
    right: { label: 'Sağa Dön', helper: 'Negatif açı', key: 'D' },
    stop: { label: 'Dur', helper: 'Acil stop', key: 'S' }
};

const PLAYBOOK_TEMPLATES = [
    { id: 'forward', label: 'İleri', description: 'Standart ileri hareket', message: '{{robot}} ileri', action: 'forward' },
    { id: 'backward', label: 'Geri', description: 'Geriye doğru lineer komut', message: '{{robot}} geri', action: 'backward' },
    { id: 'left', label: 'Sola Dön', description: 'Pozitif açı ile dönüş', message: '{{robot}} sol', action: 'left' },
    { id: 'right', label: 'Sağa Dön', description: 'Negatif açı ile dönüş', message: '{{robot}} sağ', action: 'right' },
    { id: 'stop', label: 'Dur', description: 'Acil durdurma', message: '{{robot}} dur', action: 'stop' }
];

const scenarioPresets = {
    training: {
        label: 'Teleop Eğitimi',
        description: 'Tek TurtleBot3 ile doğal dil komutları ve teleop pratiği.',
        world: 'Açık eğitim alanı. Komut otomasyonu için /cmd_text topic\'ini kullan.',
        robots: [{ name: 'turtle1', robot_type: 'turtlebot', x: 480, y: 360 }],
        obstacles: [
            { x: 720, y: 260, width: 120, height: 40, shape: 'rectangle' },
            { x: 520, y: 520, width: 80, height: 80, shape: 'rectangle' },
            { x: 880, y: 360, width: 60, height: 60, shape: 'circle' },
            { x: 340, y: 200, width: 70, height: 70, shape: 'circle' }
        ],
        topics: [
            { name: '/cmd_vel', msg_type: 'geometry_msgs/Twist' },
            { name: '/odom', msg_type: 'nav_msgs/Odometry' },
            { name: '/cmd_text', msg_type: 'std_msgs/String' }
        ],
        nodes: [
            { name: 'teleop_panel', node_type: 'control', x: 120, y: 80 },
            { name: 'turtle1', node_type: 'robot', x: 240, y: 240 }
        ],
        links: [
            { node: 'teleop_panel', topic: '/cmd_vel', type: 'publisher' },
            { node: 'turtle1', topic: '/cmd_vel', type: 'subscriber' },
            { node: 'turtle1', topic: '/odom', type: 'publisher' }
        ],
        automations: [
            { topic: '/cmd_text', trigger: 'turtle1 ileri', robot: 'turtle1', action: 'forward', matchType: 'contains' },
            { topic: '/cmd_text', trigger: 'turtle1 geri', robot: 'turtle1', action: 'backward', matchType: 'contains' },
            { topic: '/cmd_text', trigger: 'turtle1 sol', robot: 'turtle1', action: 'left', matchType: 'contains' },
            { topic: '/cmd_text', trigger: 'turtle1 sağ', robot: 'turtle1', action: 'right', matchType: 'contains' },
            { topic: '/cmd_text', trigger: 'turtle1 dur', robot: 'turtle1', action: 'stop', matchType: 'contains' }
        ]
    },
    maze: {
        label: 'Labirent Atölyesi',
        description: 'Dar koridorlarda görev paylaşımı ve SLAM deneyi.',
        world: 'Daraltılmış labirent duvarları, lidar topic\'i ve çoklu robot.',
        robots: [
            { name: 'maze_bot', robot_type: 'differential', x: 220, y: 600 },
            { name: 'scout', robot_type: 'turtlebot', x: 240, y: 150 }
        ],
        obstacles: [
            { x: 300, y: 350, width: 40, height: 500, shape: 'rectangle' },
            { x: 600, y: 150, width: 500, height: 40, shape: 'rectangle' },
            { x: 900, y: 400, width: 40, height: 500, shape: 'rectangle' },
            { x: 600, y: 550, width: 400, height: 40, shape: 'rectangle' }
        ],
        topics: [
            { name: '/scan', msg_type: 'sensor_msgs/LaserScan' },
            { name: '/cmd_vel', msg_type: 'geometry_msgs/Twist' },
            { name: '/map', msg_type: 'nav_msgs/OccupancyGrid' },
            { name: '/cmd_text', msg_type: 'std_msgs/String' }
        ],
        nodes: [
            { name: 'lidar_driver', node_type: 'sensor', x: 140, y: 120 },
            { name: 'slam_toolbox', node_type: 'compute', x: 180, y: 260 },
            { name: 'maze_bot', node_type: 'robot', x: 220, y: 420 },
            { name: 'scout', node_type: 'robot', x: 260, y: 560 }
        ],
        links: [
            { node: 'lidar_driver', topic: '/scan', type: 'publisher' },
            { node: 'slam_toolbox', topic: '/scan', type: 'subscriber' },
            { node: 'slam_toolbox', topic: '/map', type: 'publisher' },
            { node: 'maze_bot', topic: '/cmd_vel', type: 'subscriber' },
            { node: 'scout', topic: '/cmd_vel', type: 'subscriber' }
        ],
        automations: [
            { topic: '/cmd_text', trigger: 'maze_bot ileri', robot: 'maze_bot', action: 'forward', matchType: 'contains' },
            { topic: '/cmd_text', trigger: 'scout dur', robot: 'scout', action: 'stop', matchType: 'contains' }
        ]
    },
    warehouse: {
        label: 'Depo & Lojistik',
        description: 'Çoklu robot filosu ile depo koordinasyonu.',
        world: 'Raf adaları, yükleme istasyonları ve iki farklı robot tipi bulunur.',
        robots: [
            { name: 'carrier', robot_type: 'ackermann', x: 860, y: 520 },
            { name: 'picker', robot_type: 'differential', x: 620, y: 220 }
        ],
        obstacles: [
            { x: 800, y: 200, width: 200, height: 60, shape: 'rectangle' },
            { x: 1020, y: 420, width: 120, height: 200, shape: 'rectangle' },
            { x: 620, y: 420, width: 180, height: 200, shape: 'rectangle' },
            { x: 420, y: 260, width: 140, height: 140, shape: 'circle' }
        ],
        topics: [
            { name: '/fleet/cmd', msg_type: 'geometry_msgs/Twist' },
            { name: '/fleet/status', msg_type: 'std_msgs/String' },
            { name: '/cmd_text', msg_type: 'std_msgs/String' }
        ],
        nodes: [
            { name: 'fleet_manager', node_type: 'control', x: 120, y: 120 },
            { name: 'carrier', node_type: 'robot', x: 200, y: 220 },
            { name: 'picker', node_type: 'robot', x: 220, y: 320 },
            { name: 'analytics', node_type: 'compute', x: 160, y: 420 }
        ],
        links: [
            { node: 'fleet_manager', topic: '/fleet/cmd', type: 'publisher' },
            { node: 'carrier', topic: '/fleet/cmd', type: 'subscriber' },
            { node: 'picker', topic: '/fleet/cmd', type: 'subscriber' },
            { node: 'carrier', topic: '/fleet/status', type: 'publisher' },
            { node: 'picker', topic: '/fleet/status', type: 'publisher' },
            { node: 'analytics', topic: '/fleet/status', type: 'subscriber' }
        ],
        automations: [
            { topic: '/cmd_text', trigger: 'carrier ileri', robot: 'carrier', action: 'forward', matchType: 'contains' },
            { topic: '/cmd_text', trigger: 'picker sağ', robot: 'picker', action: 'right', matchType: 'contains' },
            { topic: '/cmd_text', trigger: 'fleet stop', robot: 'carrier', action: 'stop', matchType: 'contains' }
        ]
    }
};

const commandActions = [
    {
        id: 'spawn-turtle',
        label: 'TurtleBot oluştur',
        detail: 'Rastgele konumda yeni TurtleBot',
        run: () => spawnRobotWithDefaults('turtlebot')
    },
    {
        id: 'spawn-ackermann',
        label: 'Ackermann robot ekle',
        detail: 'Depo ve lojistik senaryoları için',
        run: () => spawnRobotWithDefaults('ackermann')
    },
    {
        id: 'open-automation-tab',
        label: 'Otomasyon sekmesini aç',
        detail: 'Soldaki otomasyon paneline geç',
        run: () => activateTab('automation')
    },
    {
        id: 'open-topics-tab',
        label: 'Topic & Node panelini aç',
        detail: 'Topic yönetim ekranını göster',
        run: () => activateTab('topics')
    },
    {
        id: 'open-playbook-tab',
        label: 'Komut stüdyosunu aç',
        detail: 'Hızlı komut sekmesine geç',
        run: () => activateTab('playbooks')
    },
    {
        id: 'toggle-grid',
        label: 'Grid görünümünü değiştir',
        detail: 'Simülasyon grid overlay',
        run: () => window.toggleGrid()
    },
    {
        id: 'stop-selected-robot',
        label: 'Seçili robotu durdur',
        detail: 'Acil durdurma komutu',
        run: () => {
            if (selectedRobot) {
                performAction(selectedRobot, 'stop', 'Komut Paleti');
            } else {
                pushConsole('Önce bir robot seçin', 'warning');
            }
        }
    },
    {
        id: 'load-training',
        label: 'Teleop senaryosunu yükle',
        detail: 'Varsayılan TurtleBot ortamı',
        run: () => {
            const select = document.getElementById('scenarioSelect');
            if (select) {
                select.value = 'training';
            }
            applyScenarioFromUI();
        }
    }
];

let simulator;
let canvas;
let ctx;
let rosGraphCanvas;
let rosGraphCtx;
let robots = [];
let nodes = [];
let topics = [];
let obstacles = [];
let selectedRobot = null;
let draggedRobot = null;
let obstacleMode = false;
let showGrid = true;
let currentScenario = null;
let fps = 0;
let lastFrameTime = performance.now();
let automationRules = [];
let automationTimeline = [];
let automationIdCounter = 1;
let nodeParameters = {};
let rosServices = [];
let commandPaletteVisible = false;
let paletteElement;
let paletteSearchInput;
let paletteResultsContainer;
let lastDiagUpdate = 0;
let lastDiagSample = 0;
let lastMessageSample = 0;
const diagState = { latency: '--', throughput: '--', health: '--' };

async function setup() {
    await init();
    simulator = new Ros2Simulator();

    canvas = document.getElementById('simCanvas');
    ctx = canvas.getContext('2d');
    rosGraphCanvas = document.getElementById('rosGraph');
    rosGraphCtx = rosGraphCanvas ? rosGraphCanvas.getContext('2d') : null;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleCanvasClick);

    document.addEventListener('keydown', handleKeyDown);

    document.getElementById('linearVel').addEventListener('input', updateVelocityFromSliders);
    document.getElementById('angularVel').addEventListener('input', updateVelocityFromSliders);
    document.getElementById('controlRobot').addEventListener('change', (e) => selectRobot(e.target.value));

    const scenarioSelect = document.getElementById('scenarioSelect');
    scenarioSelect.addEventListener('change', (e) => previewScenario(e.target.value));
    previewScenario(scenarioSelect.value);

    initTabs();
    setupCommandPalette();
    updatePlaybookTemplateSelect();
    renderPlaybookGrid();
    renderParameters();
    renderServices();
    updateDiagnosticsPanel();
    document.addEventListener('keydown', handleGlobalShortcuts);
    renderTimeline();
    pushConsole('ROS2 Simülatör hazır!', 'success');

    applyScenarioFromUI();
    animate();
}

setup();

function animate() {
    const now = performance.now();
    const delta = now - lastFrameTime;
    lastFrameTime = now;
    const instantFps = 1000 / Math.max(delta, 1);
    fps = fps ? fps * 0.9 + instantFps * 0.1 : instantFps;

    simulator.update_robots(now);
    updateRobotsFromSimulator();
    drawSimulation();
    updateTelemetry();
    updateFpsDisplay();
    updateDiagnostics(now);

    requestAnimationFrame(animate);
}

window.addRobot = function() {
    const name = document.getElementById('robotName').value.trim();
    const type = document.getElementById('robotType').value;

    if (!name) {
        alert('Lütfen robot ismi girin');
        return;
    }

    const x = canvas.width / 2 + (Math.random() - 0.5) * 200;
    const y = canvas.height / 2 + (Math.random() - 0.5) * 200;

    simulator.add_robot(name, type, x, y);
    document.getElementById('robotName').value = '';
    updateRobotsList();
    updateStats();
    pushConsole(`Yeni robot eklendi: ${name} (${type})`, 'info');
};

window.addTopic = function() {
    const name = document.getElementById('topicName').value.trim();
    const msgType = document.getElementById('msgType').value;

    if (!name) {
        alert('Lütfen topic ismi girin');
        return;
    }

    simulator.add_topic(name, msgType);
    document.getElementById('topicName').value = '';
    updateTopicsList();
    updateStats();
    pushConsole(`${name} topic'i oluşturuldu`, 'info');
};

window.addNode = function() {
    const name = document.getElementById('nodeName').value.trim();
    const nodeType = document.getElementById('nodeType').value;

    if (!name) {
        alert('Node ismi gerekli');
        return;
    }

    if (nodes.some((node) => node.name === name)) {
        alert('Bu isimde bir node zaten mevcut');
        return;
    }

    const x = 80.0 + Math.random() * 200.0;
    const y = 80.0 + Math.random() * 300.0;
    simulator.add_node(name, nodeType, x, y);
    document.getElementById('nodeName').value = '';
    updateNodesList();
    pushConsole(`${name} node'u eklendi`, 'info');
};

window.linkNodeTopic = function() {
    const nodeName = document.getElementById('nodeConnect').value;
    const topicName = document.getElementById('topicConnect').value;
    const mode = document.getElementById('connectionType').value;

    if (!nodeName || !topicName) {
        alert('Node ve topic seçimi zorunlu');
        return;
    }

    try {
        if (mode === 'publisher') {
            simulator.publish(nodeName, topicName);
            pushConsole(`${nodeName} artık ${topicName} topic'ine yayın yapıyor`, 'success');
        } else {
            simulator.subscribe(nodeName, topicName);
            pushConsole(`${nodeName} artık ${topicName} topic'ini dinliyor`, 'success');
        }
        updateTopicsList();
    } catch (err) {
        console.error(err);
        alert('Bağlantı sırasında hata oluştu. Önce node ve topic oluşturduğunuzdan emin olun.');
    }
};

window.sendMessage = function(fromTemplate = false) {
    const topicName = document.getElementById('sendTopic').value;
    const data = document.getElementById('messageData').value.trim();

    if (!topicName || !data) {
        if (!fromTemplate) {
            alert('Topic ve mesaj gereklidir');
        }
        return;
    }

    const timestamp = Date.now();
    simulator.send_message(topicName, data, timestamp);

    const monitor = document.getElementById('messageMonitor');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.innerHTML = `
        <strong>[${new Date(timestamp).toLocaleTimeString()}]</strong>
        <span style="color: #00bcd4">${topicName}</span>: ${data}
    `;
    monitor.prepend(messageDiv);

    while (monitor.children.length > 30) {
        monitor.removeChild(monitor.lastChild);
    }

    updateStats();
    pushConsole(`${topicName} topic'ine mesaj gönderildi`, 'info');
    handleIncomingMessage(topicName, data);
};

window.setVelocity = function(linear, angular) {
    const select = document.getElementById('controlRobot');
    let robotName = select.value;

    if (!robotName && robots.length > 0) {
        robotName = robots[0].name;
        select.value = robotName;
        selectRobot(robotName);
    }

    if (!robotName) {
        alert('Önce robot seçin');
        return;
    }

    simulator.set_robot_velocity(robotName, linear, angular);
    document.getElementById('linearVel').value = linear;
    document.getElementById('angularVel').value = angular;
    document.getElementById('linearVelValue').textContent = linear;
    document.getElementById('angularVelValue').textContent = angular.toFixed(1);
};

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

window.addObstacleMode = function() {
    obstacleMode = !obstacleMode;
    document.getElementById('simMode').textContent = obstacleMode ? 'Mode: Engel Ekleme' : 'Mode: Normal';
    const button = document.getElementById('obstacleModeBtn');
    if (button) {
        button.textContent = obstacleMode ? 'Engel Modu Aktif' : "Canvas'a Tıklayarak Ekle";
        button.classList.toggle('active', obstacleMode);
    }
    pushConsole(obstacleMode ? 'Engel yerleştirme modu açıldı' : 'Engel modu kapatıldı', 'info');
};

window.toggleGrid = function() {
    showGrid = !showGrid;
    const button = document.getElementById('gridToggleBtn');
    if (button) {
        button.textContent = showGrid ? 'Grid: Açık' : 'Grid: Kapalı';
    }
    pushConsole(showGrid ? 'Grid görünür' : 'Grid kapalı', 'info');
};

window.clearObstacles = function() {
    simulator.clear_obstacles();
    obstacles = [];
    updateRobotsFromSimulator();
    updateStats();
    pushConsole('Tüm engeller kaldırıldı', 'warning');
};

window.clearMessages = function() {
    document.getElementById('messageMonitor').innerHTML = '';
    simulator.clear_messages();
    updateStats();
};

window.clearConsole = function() {
    const consoleEl = document.getElementById('systemConsole');
    if (consoleEl) {
        consoleEl.innerHTML = '';
    }
};

window.resetSimulator = function() {
    simulator.reset();
    robots = [];
    nodes = [];
    topics = [];
    obstacles = [];
    selectedRobot = null;
    document.getElementById('controlRobot').value = '';
    document.getElementById('messageMonitor').innerHTML = '';
    document.getElementById('scenarioDescription').textContent = 'Simülasyon sıfırlandı. Yeni bir senaryo seçin.';
    document.getElementById('activeScenario').textContent = 'Aktif Senaryo: -';
    document.getElementById('worldDescription').textContent = 'Boş dünya aktif.';
    currentScenario = null;
    resetAutomations();
    updateRobotsList();
    updateNodesList();
    updateTopicsList();
    updateStats();
    drawRosGraph();
    renderTimeline();
    pushConsole('Simülasyon tamamen sıfırlandı', 'warning');
};

function applyScenarioFromUI() {
    const key = document.getElementById('scenarioSelect').value;
    const scenario = scenarioPresets[key];
    if (!scenario) {
        return;
    }

    simulator.reset();
    robots = [];
    nodes = [];
    topics = [];
    obstacles = [];
    selectedRobot = null;
    document.getElementById('controlRobot').value = '';
    document.getElementById('messageMonitor').innerHTML = '';

    scenario.robots?.forEach((robot) => {
        simulator.add_robot(robot.name, robot.robot_type, robot.x, robot.y);
    });

    scenario.obstacles?.forEach((obs) => {
        simulator.add_obstacle(obs.x, obs.y, obs.width, obs.height, obs.shape);
    });

    scenario.topics?.forEach((topic) => {
        simulator.add_topic(topic.name, topic.msg_type);
    });

    scenario.nodes?.forEach((node) => {
        simulator.add_node(node.name, node.node_type, node.x, node.y);
    });

    scenario.links?.forEach((link) => {
        try {
            if (link.type === 'publisher') {
                simulator.publish(link.node, link.topic);
            } else {
                simulator.subscribe(link.node, link.topic);
            }
        } catch (err) {
            console.warn('Hazır senaryo bağlantısı kurulamadı:', err);
        }
    });

    currentScenario = key;
    document.getElementById('scenarioDescription').textContent = scenario.description;
    document.getElementById('activeScenario').textContent = `Aktif Senaryo: ${scenario.label}`;
    document.getElementById('worldDescription').textContent = scenario.world;

    resetAutomations();
    seedAutomations(scenario.automations || []);

    updateRobotsList();
    updateNodesList();
    updateTopicsList();
    updateStats();
    drawRosGraph();
    updateTelemetry();
    pushConsole(`${scenario.label} senaryosu yüklendi`, 'success');
}

window.applyScenario = applyScenarioFromUI;

function previewScenario(key) {
    const scenario = scenarioPresets[key];
    const descEl = document.getElementById('scenarioDescription');
    if (!descEl) {
        return;
    }
    if (!scenario || currentScenario === key) {
        descEl.textContent = scenario ? scenario.description : 'Senaryo seçerek başlayın.';
    } else {
        descEl.textContent = `Seçili senaryo: ${scenario.label} – ${scenario.description}`;
    }
}

function updateRobotsList() {
    const robotsJson = simulator.get_robots_json();
    robots = JSON.parse(robotsJson);

    const select = document.getElementById('controlRobot');
    const previous = select.value;
    select.innerHTML = '<option value="">Robot Seç...</option>';

    robots.forEach((robot) => {
        const option = document.createElement('option');
        option.value = robot.name;
        option.textContent = `${robot.name} (${robot.robot_type})`;
        select.appendChild(option);
    });

    const automationRobotSelect = document.getElementById('automationRobot');
    if (automationRobotSelect) {
        const previousAutomation = automationRobotSelect.value;
        automationRobotSelect.innerHTML = '<option value="">Robot seç...</option>';
        robots.forEach((robot) => {
            const opt = document.createElement('option');
            opt.value = robot.name;
            opt.textContent = robot.name;
            automationRobotSelect.appendChild(opt);
        });
        if (robots.some((robot) => robot.name === previousAutomation)) {
            automationRobotSelect.value = previousAutomation;
        }
    }

    const playbookRobotSelect = document.getElementById('playbookRobot');
    if (playbookRobotSelect) {
        const previousPlaybook = playbookRobotSelect.value;
        playbookRobotSelect.innerHTML = '<option value="">Robot seç...</option>';
        robots.forEach((robot) => {
            const opt = document.createElement('option');
            opt.value = robot.name;
            opt.textContent = robot.name;
            playbookRobotSelect.appendChild(opt);
        });
        if (robots.some((robot) => robot.name === previousPlaybook)) {
            playbookRobotSelect.value = previousPlaybook;
        }
    }

    const stillExists = robots.some((robot) => robot.name === previous);
    if (stillExists) {
        select.value = previous;
    } else if (selectedRobot && !robots.some((robot) => robot.name === selectedRobot)) {
        selectedRobot = null;
        select.value = '';
    }

    document.getElementById('robotCount').textContent = robots.length;
    updateWorldIndicators();
    renderPlaybookGrid();
}

function updateTopicsList() {
    const topicsJson = simulator.get_topics_json();
    topics = JSON.parse(topicsJson);

    const sendSelect = document.getElementById('sendTopic');
    sendSelect.innerHTML = '<option value="">Topic Seç...</option>';

    const connectSelect = document.getElementById('topicConnect');
    connectSelect.innerHTML = '<option value="">Topic Seç...</option>';

    topics.forEach((topic) => {
        const option = document.createElement('option');
        option.value = topic.name;
        option.textContent = `${topic.name} (${topic.msg_type})`;
        sendSelect.appendChild(option.cloneNode(true));
        connectSelect.appendChild(option);
    });

    const list = document.getElementById('topicList');
    list.innerHTML = '';
    if (topics.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'Henüz topic eklenmedi';
        list.appendChild(empty);
    } else {
        topics.forEach((topic) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${topic.name}</strong>
                <span>${topic.msg_type}</span>
                <small>${topic.publishers.length} pub | ${topic.subscribers.length} sub</small>
            `;
            list.appendChild(li);
        });
    }

    document.getElementById('topicCount').textContent = topics.length;
    drawRosGraph();

    const playbookTopicSelect = document.getElementById('playbookTopic');
    if (playbookTopicSelect) {
        const previous = playbookTopicSelect.value;
        playbookTopicSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '/cmd_text';
        defaultOption.textContent = '/cmd_text (önerilen)';
        playbookTopicSelect.appendChild(defaultOption);

        topics
            .filter((topic) => topic.msg_type.toLowerCase().includes('string'))
            .forEach((topic) => {
                const option = document.createElement('option');
                option.value = topic.name;
                option.textContent = topic.name;
                playbookTopicSelect.appendChild(option);
            });

        if (Array.from(playbookTopicSelect.options).some((opt) => opt.value === previous)) {
            playbookTopicSelect.value = previous;
        }
    }
}

function updateNodesList() {
    const nodesJson = simulator.get_nodes_json();
    nodes = JSON.parse(nodesJson);

    const connectSelect = document.getElementById('nodeConnect');
    connectSelect.innerHTML = '<option value="">Node Seç...</option>';
    nodes.forEach((node) => {
        const option = document.createElement('option');
        option.value = node.name;
        option.textContent = `${node.name} (${node.node_type})`;
        connectSelect.appendChild(option);
    });

    const list = document.getElementById('nodeList');
    list.innerHTML = '';
    if (nodes.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'Node oluşturulmadı';
        list.appendChild(empty);
    } else {
        nodes.forEach((node) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${node.name}</strong>
                <span>${node.node_type}</span>
            `;
            list.appendChild(li);
        });
    }

    document.getElementById('nodeCount').textContent = nodes.length;
    updateWorldIndicators();
    drawRosGraph();
}

function updateStats() {
    document.getElementById('robotCount').textContent = robots.length;
    document.getElementById('topicCount').textContent = topics.length;
    document.getElementById('nodeCount').textContent = nodes.length;
    document.getElementById('obstacleCount').textContent = obstacles.length;
    document.getElementById('automationCount').textContent = automationRules.length;

    const messagesJson = simulator.get_messages_json();
    const msgs = JSON.parse(messagesJson);
    document.getElementById('messageCount').textContent = msgs.length;
}

function updateRobotsFromSimulator() {
    const robotsJson = simulator.get_robots_json();
    robots = JSON.parse(robotsJson);

    const obstaclesJson = simulator.get_obstacles_json();
    obstacles = JSON.parse(obstaclesJson);

    updateWorldIndicators();
}

function updateWorldIndicators() {
    const obstacleValue = obstacles.length;
    document.getElementById('obstacleCount').textContent = obstacleValue;
    document.getElementById('worldObstacle').textContent = obstacleValue;
    document.getElementById('worldRobots').textContent = robots.length;
    document.getElementById('worldNodes').textContent = nodes.length;
}

function updateTelemetry() {
    const telemetryName = document.getElementById('telemetryName');
    const position = document.getElementById('telemetryPosition');
    const heading = document.getElementById('telemetryHeading');
    const linear = document.getElementById('telemetryLinear');
    const angular = document.getElementById('telemetryAngular');

    const robot = robots.find((r) => r.name === selectedRobot);
    if (!robot) {
        telemetryName.textContent = 'Robot seçilmedi';
        position.textContent = 'x: -, y: -';
        heading.textContent = '0°';
        linear.textContent = '0 m/s';
        angular.textContent = '0 rad/s';
        return;
    }

    telemetryName.textContent = `${robot.name} (${robot.robot_type})`;
    position.textContent = `x: ${robot.x.toFixed(0)}, y: ${robot.y.toFixed(0)}`;
    heading.textContent = `${(robot.theta * (180 / Math.PI)).toFixed(0)}°`;
    linear.textContent = `${robot.linear_vel.toFixed(1)} m/s`;
    angular.textContent = `${robot.angular_vel.toFixed(2)} rad/s`;
}

function updateFpsDisplay() {
    const fpsEl = document.getElementById('fpsValue');
    if (fpsEl) {
        fpsEl.textContent = Math.round(fps).toString();
    }
}

function drawSimulation() {
    ctx.fillStyle = '#05050f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
        drawGrid();
    }

    obstacles.forEach((obs) => drawObstacle(obs));
    robots.forEach((robot) => drawRobot(robot));
}

function drawGrid() {
    const gridSize = 50;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
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
}

function drawRobot(robot) {
    ctx.save();
    ctx.translate(robot.x, robot.y);
    ctx.rotate(robot.theta);

    const colors = {
        turtlebot: '#4CAF50',
        differential: '#2196F3',
        ackermann: '#FF9800'
    };
    const color = colors[robot.robot_type] || '#9c27b0';

    ctx.fillStyle = color;
    ctx.fillRect(-robot.width / 2, -robot.height / 2, robot.width, robot.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-robot.width / 2, -robot.height / 2, robot.width, robot.height);

    ctx.beginPath();
    ctx.moveTo(robot.width / 2, 0);
    ctx.lineTo(robot.width / 2 + 15, 0);
    ctx.strokeStyle = '#ffeb3b';
    ctx.stroke();

    ctx.restore();

    if (robot.name === selectedRobot) {
        ctx.beginPath();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.arc(robot.x, robot.y, robot.width, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(robot.name, robot.x, robot.y - robot.height / 2 - 10);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#0ff';
    ctx.fillText(
        `v:${robot.linear_vel.toFixed(0)} ω:${robot.angular_vel.toFixed(1)}`,
        robot.x,
        robot.y + robot.height / 2 + 20
    );
}

function drawObstacle(obs) {
    if (obs.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244, 67, 54, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        ctx.fillStyle = 'rgba(244, 67, 54, 0.5)';
        ctx.fillRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
    }
}

function handleKeyDown(e) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
    }

    switch (e.key.toLowerCase()) {
        case 'w':
            setVelocity(50, 0);
            break;
        case 'x':
            setVelocity(-50, 0);
            break;
        case 'a':
            setVelocity(0, 1);
            break;
        case 'd':
            setVelocity(0, -1);
            break;
        case 's':
            setVelocity(0, 0);
            break;
        default:
            break;
    }
}

function handleMouseDown(e) {
    const { x, y } = getCanvasCoordinates(e);
    robots.forEach((robot) => {
        const dx = x - robot.x;
        const dy = y - robot.y;
        if (Math.abs(dx) < robot.width / 2 && Math.abs(dy) < robot.height / 2) {
            draggedRobot = robot;
        }
    });
}

function handleMouseMove(e) {
    const { x, y } = getCanvasCoordinates(e);
    document.getElementById('mousePos').textContent = `Mouse: (${Math.floor(x)}, ${Math.floor(y)})`;

    if (draggedRobot) {
        simulator.move_robot(draggedRobot.name, x, y);
    }
}

function handleMouseUp() {
    draggedRobot = null;
}

function handleCanvasClick(e) {
    const { x, y } = getCanvasCoordinates(e);

    if (obstacleMode) {
        const shape = document.getElementById('obstacleShape').value;
        const size = 60;
        simulator.add_obstacle(x, y, size, size, shape);
        updateRobotsFromSimulator();
        updateStats();
        pushConsole(`Engel eklendi (${Math.floor(x)}, ${Math.floor(y)})`, 'info');
        return;
    }

    const clickedRobot = robots.find(
        (robot) => Math.abs(x - robot.x) < robot.width / 2 && Math.abs(y - robot.y) < robot.height / 2
    );

    if (clickedRobot) {
        selectRobot(clickedRobot.name);
        document.getElementById('controlRobot').value = clickedRobot.name;
        pushConsole(`${clickedRobot.name} seçildi`, 'info');
    }
}

function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function selectRobot(name) {
    selectedRobot = name || null;
    updateTelemetry();
}

function pushConsole(message, level = 'info') {
    const consoleEl = document.getElementById('systemConsole');
    if (!consoleEl) {
        return;
    }
    const entry = document.createElement('div');
    entry.className = `console-line ${level}`;
    entry.innerHTML = `<span class="time">[${new Date().toLocaleTimeString()}]</span> ${message}`;
    consoleEl.prepend(entry);

    while (consoleEl.children.length > 40) {
        consoleEl.removeChild(consoleEl.lastChild);
    }
}

function drawRosGraph() {
    if (!rosGraphCtx || !rosGraphCanvas) {
        return;
    }

    const width = rosGraphCanvas.width;
    const height = rosGraphCanvas.height;
    rosGraphCtx.clearRect(0, 0, width, height);

    if (!nodes.length && !topics.length) {
        rosGraphCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        rosGraphCtx.font = '16px monospace';
        rosGraphCtx.fillText('Node ve topic ekleyin', 20, 40);
        return;
    }

    const nodeSpacing = height / Math.max(nodes.length + 1, 2);
    const topicSpacing = height / Math.max(topics.length + 1, 2);

    const nodePositions = new Map();
    nodes.forEach((node, index) => {
        const x = 160;
        const y = nodeSpacing * (index + 1);
        nodePositions.set(node.name, { x, y });
        drawGraphNode(x, y, node);
    });

    const topicPositions = new Map();
    topics.forEach((topic, index) => {
        const x = width - 160;
        const y = topicSpacing * (index + 1);
        topicPositions.set(topic.name, { x, y });
        drawGraphTopic(x, y, topic);
    });

    topics.forEach((topic) => {
        const topicPos = topicPositions.get(topic.name);
        if (!topicPos) {
            return;
        }
        topic.publishers.forEach((pub) => {
            const nodePos = nodePositions.get(pub);
            if (!nodePos) {
                return;
            }
            drawGraphEdge(nodePos, topicPos, '#00bcd4');
        });
        topic.subscribers.forEach((sub) => {
            const nodePos = nodePositions.get(sub);
            if (!nodePos) {
                return;
            }
            drawGraphEdge(topicPos, nodePos, '#ff9800');
        });
    });
}

function drawGraphNode(x, y, node) {
    rosGraphCtx.fillStyle = '#00e5ff';
    rosGraphCtx.strokeStyle = '#ffffff';
    rosGraphCtx.lineWidth = 2;
    rosGraphCtx.beginPath();
    rosGraphCtx.arc(x, y, 30, 0, Math.PI * 2);
    rosGraphCtx.fill();
    rosGraphCtx.stroke();
    rosGraphCtx.fillStyle = '#051937';
    rosGraphCtx.font = '12px Arial';
    rosGraphCtx.textAlign = 'center';
    rosGraphCtx.fillText(node.name, x, y + 4);
}

function drawGraphTopic(x, y, topic) {
    rosGraphCtx.fillStyle = '#7C4DFF';
    rosGraphCtx.strokeStyle = '#ffffff';
    rosGraphCtx.lineWidth = 2;
    drawRoundedRect(rosGraphCtx, x - 50, y - 20, 100, 40, 10);
    rosGraphCtx.fill();
    rosGraphCtx.stroke();
    rosGraphCtx.fillStyle = '#fff';
    rosGraphCtx.font = '11px Arial';
    rosGraphCtx.textAlign = 'center';
    rosGraphCtx.fillText(topic.name, x, y);
}

function drawRoundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
}

function drawGraphEdge(from, to, color) {
    rosGraphCtx.strokeStyle = color;
    rosGraphCtx.lineWidth = 2;
    rosGraphCtx.beginPath();
    rosGraphCtx.moveTo(from.x, from.y);
    rosGraphCtx.lineTo(to.x, to.y);
    rosGraphCtx.stroke();
}

function updatePlaybookTemplateSelect() {
    const templateSelect = document.getElementById('playbookTemplate');
    if (!templateSelect) {
        return;
    }
    templateSelect.innerHTML = '';
    PLAYBOOK_TEMPLATES.forEach((template, index) => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.label} (${template.description})`;
        if (index === 0) {
            option.selected = true;
        }
        templateSelect.appendChild(option);
    });
}

function renderPlaybookGrid() {
    const grid = document.getElementById('playbookGrid');
    if (!grid) {
        return;
    }
    grid.innerHTML = '';

    if (robots.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'muted';
        empty.textContent = 'Herhangi bir robot bulunamadı.';
        grid.appendChild(empty);
        return;
    }

    robots.forEach((robot) => {
        const card = document.createElement('div');
        card.className = 'playbook-card';
        card.innerHTML = `
            <div>
                <h4>${robot.name}</h4>
                <span>${robot.robot_type}</span>
            </div>
        `;

        const actionsRow = document.createElement('div');
        actionsRow.className = 'playbook-actions';

        PLAYBOOK_TEMPLATES.forEach((template) => {
            const btn = document.createElement('button');
            btn.className = 'btn-small';
            btn.textContent = template.label;
            btn.addEventListener('click', () => sendPlaybookTemplate(robot.name, template.id));
            actionsRow.appendChild(btn);
        });

        card.appendChild(actionsRow);
        grid.appendChild(card);
    });
}

function sendPlaybookCommand() {
    const robotSelect = document.getElementById('playbookRobot');
    const templateSelect = document.getElementById('playbookTemplate');
    const topicSelect = document.getElementById('playbookTopic');

    const robotName = robotSelect?.value;
    const templateId = templateSelect?.value || PLAYBOOK_TEMPLATES[0].id;
    const template = PLAYBOOK_TEMPLATES.find((tpl) => tpl.id === templateId) || PLAYBOOK_TEMPLATES[0];
    const topic = topicSelect?.value || '/cmd_text';

    if (!robotName) {
        alert('Önce bir robot seçin');
        return;
    }

    ensureTopicExists(topic, 'std_msgs/String');
    const message = template.message.replace('{{robot}}', robotName);
    const sendTopicSelect = document.getElementById('sendTopic');
    const messageInput = document.getElementById('messageData');
    if (sendTopicSelect && messageInput) {
        sendTopicSelect.value = topic;
        messageInput.value = message;
    }
    window.sendMessage(true);
    performAction(robotName, template.action, 'Komut Stüdyosu');
}

function sendPlaybookTemplate(robotName, templateId) {
    const template = PLAYBOOK_TEMPLATES.find((tpl) => tpl.id === templateId) || PLAYBOOK_TEMPLATES[0];
    const topicSelect = document.getElementById('playbookTopic');
    const topic = topicSelect?.value || '/cmd_text';
    ensureTopicExists(topic, 'std_msgs/String');
    const message = template.message.replace('{{robot}}', robotName);
    const sendTopicSelect = document.getElementById('sendTopic');
    const messageInput = document.getElementById('messageData');
    if (sendTopicSelect && messageInput) {
        sendTopicSelect.value = topic;
        messageInput.value = message;
    }
    window.sendMessage(true);
    performAction(robotName, template.action, 'Komut Stüdyosu');
}

function ensureTopicExists(name, msgType = 'std_msgs/String') {
    if (!topics.some((topic) => topic.name === name)) {
        simulator.add_topic(name, msgType);
        updateTopicsList();
        pushConsole(`${name} topic'i otomatik eklendi`, 'info');
    }
}

window.addAutomationRule = function() {
    const topic = document.getElementById('automationTopic').value.trim();
    const trigger = document.getElementById('automationTrigger').value.trim();
    const robot = document.getElementById('automationRobot').value;
    const action = document.getElementById('automationAction').value;
    const matchType = document.getElementById('automationMatch').value;

    if (!topic || !trigger || !robot) {
        alert('Topic, tetikleyici ve robot zorunludur');
        return;
    }

    registerAutomationRule({ topic, trigger, robot, action, matchType });
    renderAutomationRules();
    updateStats();
    pushConsole(`Otomasyon kuralı eklendi (${trigger} → ${robot})`, 'success');

    document.getElementById('automationTrigger').value = '';
};

window.removeAutomationRule = function(id) {
    automationRules = automationRules.filter((rule) => rule.id !== id);
    renderAutomationRules();
    updateStats();
};

function registerAutomationRule({ topic, trigger, robot, action = 'forward', matchType = 'contains' }) {
    const rule = {
        id: automationIdCounter++,
        topic,
        trigger,
        robot,
        action,
        matchType
    };
    automationRules.push(rule);
    return rule;
}

function resetAutomations() {
    automationRules = [];
    automationIdCounter = 1;
    renderAutomationRules();
    updateStats();
}

function seedAutomations(ruleList) {
    ruleList.forEach((rule) => registerAutomationRule(rule));
    renderAutomationRules();
    updateStats();
}

function renderAutomationRules() {
    const list = document.getElementById('automationList');
    if (!list) {
        return;
    }
    list.innerHTML = '';

    if (automationRules.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'Aktif otomasyon kuralı yok';
        list.appendChild(empty);
        return;
    }

    automationRules.forEach((rule) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${rule.trigger}</strong>
            <span>${rule.topic} • ${rule.matchType}</span>
            <small>${rule.robot} → ${ACTION_PRESETS[rule.action]?.label || rule.action}</small>
            <button class="btn-small" data-id="${rule.id}">Sil</button>
        `;
        li.querySelector('button').addEventListener('click', () => window.removeAutomationRule(rule.id));
        list.appendChild(li);
    });
}

function handleIncomingMessage(topic, data) {
    const triggered = evaluateAutomationRules(topic, data);
    const natural = evaluateNaturalLanguage(topic, data);
    if (!triggered && !natural) {
        appendTimelineEntry(`${topic} → ${data}`, 'info');
    }
}

function evaluateAutomationRules(topic, message) {
    let triggered = false;
    automationRules.forEach((rule) => {
        if (rule.topic !== topic) {
            return;
        }
        if (matchMessage(rule.matchType, rule.trigger, message)) {
            performAction(rule.robot, rule.action, `Otomasyon (${rule.trigger})`);
            triggered = true;
        }
    });
    return triggered;
}

function matchMessage(type, trigger, message) {
    const normalizedTrigger = trigger.toLowerCase();
    const normalizedMessage = message.toLowerCase();
    switch (type) {
        case 'exact':
            return normalizedMessage === normalizedTrigger;
        case 'prefix':
            return normalizedMessage.startsWith(normalizedTrigger);
        case 'contains':
        default:
            return normalizedMessage.includes(normalizedTrigger);
    }
}

function evaluateNaturalLanguage(topic, message) {
    const parsed = parseNaturalCommand(message);
    if (!parsed) {
        return false;
    }
    ensureTopicExists(topic);
    performAction(parsed.robot, parsed.action, 'Doğal Dil');
    return true;
}

function parseNaturalCommand(message) {
    const text = message.trim().toLowerCase();
    const pattern = /([a-z0-9_]+)\s+(ileri|geriye|geri|sola|sol|saga|sağa|sag|sağ|dur|stop|sağa dön|sola dön)/i;
    const match = text.match(pattern);
    if (!match) {
        return null;
    }
    const robot = match[1];
    const keyword = match[2];
    if (keyword.includes('ileri')) {
        return { robot, action: 'forward' };
    }
    if (keyword.includes('geri')) {
        return { robot, action: 'backward' };
    }
    if (keyword.includes('sol')) {
        return { robot, action: 'left' };
    }
    if (keyword.includes('sa')) {
        return { robot, action: 'right' };
    }
    if (keyword.includes('dur') || keyword.includes('stop')) {
        return { robot, action: 'stop' };
    }
    return null;
}

function performAction(robotName, actionKey, source = 'Manual') {
    if (!robotName) {
        return;
    }
    const preset = ACTION_PRESETS[actionKey] || ACTION_PRESETS.forward;

    if (!robots.some((robot) => robot.name === robotName)) {
        pushConsole(`Robot bulunamadı: ${robotName}`, 'warning');
        return;
    }

    if (simulator.apply_action) {
        simulator.apply_action(robotName, actionKey);
    } else {
        const fallback = {
            forward: { linear: 60, angular: 0 },
            backward: { linear: -40, angular: 0 },
            left: { linear: 0, angular: 1.2 },
            right: { linear: 0, angular: -1.2 },
            stop: { linear: 0, angular: 0 }
        };
        const velocities = fallback[actionKey] || fallback.forward;
        simulator.set_robot_velocity(robotName, velocities.linear, velocities.angular);
    }

    appendTimelineEntry(`${robotName} → ${preset.label} (${source})`, 'success');
    pushConsole(`${robotName} ${preset.label} moduna geçti (${source})`, 'success');
    selectRobot(robotName);
}

function appendTimelineEntry(text, level = 'info') {
    automationTimeline.unshift({ text, level, time: new Date() });
    if (automationTimeline.length > 40) {
        automationTimeline.pop();
    }
    renderTimeline();
}

function renderTimeline() {
    const container = document.getElementById('automationTimeline');
    if (!container) {
        return;
    }
    container.innerHTML = '';
    if (automationTimeline.length === 0) {
        container.innerHTML = '<p class="muted">Henüz otomasyon tetiklenmedi.</p>';
        return;
    }

    automationTimeline.forEach((entry) => {
        const row = document.createElement('div');
        row.className = `timeline-entry ${entry.level}`;
        row.innerHTML = `
            <span class="time">${entry.time.toLocaleTimeString()}</span>
            <span class="text">${entry.text}</span>
        `;
        container.appendChild(row);
    });
}

function initTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => activateTab(btn.dataset.tab));
    });
}

function activateTab(tab) {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('[data-tab-content]');
    buttons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    contents.forEach((content) => {
        content.classList.toggle('active', content.dataset.tabContent === tab);
    });
}

function setupCommandPalette() {
    paletteElement = document.getElementById('commandPalette');
    paletteSearchInput = document.getElementById('paletteSearch');
    paletteResultsContainer = document.getElementById('paletteResults');
    const closeBtn = document.getElementById('paletteClose');

    if (!paletteElement || !paletteSearchInput || !paletteResultsContainer || !closeBtn) {
        return;
    }

    closeBtn.addEventListener('click', closeCommandPalette);
    paletteSearchInput.addEventListener('input', (e) => updatePaletteResults(e.target.value));
    paletteElement.addEventListener('click', (e) => {
        if (e.target === paletteElement) {
            closeCommandPalette();
        }
    });
    updatePaletteResults('');
}

function openCommandPalette() {
    if (!paletteElement) {
        return;
    }
    commandPaletteVisible = true;
    paletteElement.classList.remove('hidden');
    paletteElement.classList.add('visible');
    if (paletteSearchInput) {
        paletteSearchInput.value = '';
        requestAnimationFrame(() => paletteSearchInput.focus());
    }
    updatePaletteResults('');
}

function closeCommandPalette() {
    if (!paletteElement) {
        return;
    }
    commandPaletteVisible = false;
    paletteElement.classList.add('hidden');
    paletteElement.classList.remove('visible');
}

function updatePaletteResults(filter = '') {
    if (!paletteResultsContainer) {
        return;
    }
    const normalized = filter.trim().toLowerCase();
    const filtered = commandActions.filter(
        (action) =>
            !normalized ||
            action.label.toLowerCase().includes(normalized) ||
            action.detail.toLowerCase().includes(normalized)
    );

    paletteResultsContainer.innerHTML = '';
    if (filtered.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'muted';
        empty.textContent = 'Eşleşen komut bulunamadı.';
        paletteResultsContainer.appendChild(empty);
        return;
    }

    filtered.forEach((action) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'palette-item';
        item.innerHTML = `
            <strong>${action.label}</strong>
            <span>${action.detail}</span>
        `;
        item.addEventListener('click', () => {
            runCommandAction(action);
            closeCommandPalette();
        });
        paletteResultsContainer.appendChild(item);
    });
}

function runCommandAction(action) {
    try {
        action.run?.();
        appendTimelineEntry(`${action.label}`, 'info');
    } catch (err) {
        console.error(err);
        pushConsole('Komut çalıştırılamadı', 'warning');
    }
}

function handleGlobalShortcuts(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
    }
    if (e.key === 'Escape' && commandPaletteVisible) {
        closeCommandPalette();
    }
}

window.addParameter = function() {
    const node = document.getElementById('parameterNode')?.value.trim();
    const key = document.getElementById('parameterKey')?.value.trim();
    const value = document.getElementById('parameterValue')?.value.trim();

    if (!node || !key || value === undefined) {
        alert('Node, parametre adı ve değer gereklidir');
        return;
    }

    if (!nodeParameters[node]) {
        nodeParameters[node] = [];
    }

    const existing = nodeParameters[node].find((param) => param.key === key);
    if (existing) {
        existing.value = value;
    } else {
        nodeParameters[node].push({ key, value });
    }

    renderParameters();
    pushConsole(`${node}.${key} parametresi güncellendi`, 'info');

    document.getElementById('parameterKey').value = '';
    document.getElementById('parameterValue').value = '';
};

function renderParameters() {
    const list = document.getElementById('parameterList');
    if (!list) {
        return;
    }
    list.innerHTML = '';

    const entries = Object.entries(nodeParameters);
    if (entries.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'Parametre eklenmedi';
        list.appendChild(empty);
        return;
    }

    entries.forEach(([node, params]) => {
        params.forEach((param) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${node}.${param.key}</strong>
                <span>${param.value}</span>
                <button class=\"btn-small\">Sil</button>
            `;
            li.querySelector('button').addEventListener('click', () => removeParameter(node, param.key));
            list.appendChild(li);
        });
    });
}

function removeParameter(node, key) {
    if (!nodeParameters[node]) {
        return;
    }
    nodeParameters[node] = nodeParameters[node].filter((param) => param.key !== key);
    if (nodeParameters[node].length === 0) {
        delete nodeParameters[node];
    }
    renderParameters();
}

window.registerService = function() {
    const name = document.getElementById('serviceName')?.value.trim();
    const type = document.getElementById('serviceType')?.value.trim();
    const endpoint = document.getElementById('serviceEndpoint')?.value.trim();

    if (!name || !type) {
        alert('Servis adı ve tipi zorunludur');
        return;
    }

    if (rosServices.some((srv) => srv.name === name)) {
        alert('Bu servis zaten tanımlı');
        return;
    }

    rosServices.push({ name, type, endpoint: endpoint || 'Simüle' });
    renderServices();
    pushConsole(`${name} servisi kaydedildi`, 'success');

    document.getElementById('serviceName').value = '';
    document.getElementById('serviceType').value = '';
    document.getElementById('serviceEndpoint').value = '';
};

function renderServices() {
    const container = document.getElementById('serviceList');
    if (!container) {
        return;
    }
    container.innerHTML = '';

    if (rosServices.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'muted';
        empty.textContent = 'Servis tanımlı değil.';
        container.appendChild(empty);
        return;
    }

    rosServices.forEach((service) => {
        const row = document.createElement('div');
        row.className = 'service-item';
        row.innerHTML = `
            <div>
                <strong>${service.name}</strong>
                <span>${service.type}</span>
                <small>${service.endpoint}</small>
            </div>
            <button class=\"btn-small\">Çağır</button>
        `;
        row.querySelector('button').addEventListener('click', () => window.callService(service.name));
        container.appendChild(row);
    });
}

window.callService = function(name) {
    const srv = rosServices.find((service) => service.name === name);
    if (!srv) {
        pushConsole(`Servis bulunamadı: ${name}`, 'warning');
        return;
    }
    appendTimelineEntry(`Servis çağrıldı: ${name}`, 'info');
    pushConsole(`${name} servisi (${srv.type}) tetiklendi`, 'success');
};

function updateDiagnostics(now) {
    if (now - lastDiagUpdate < 500) {
        return;
    }
    const elapsed = lastDiagSample ? (now - lastDiagSample) / 1000 : 0;
    const messages = JSON.parse(simulator.get_messages_json());
    const msgCount = messages.length;
    const delta = elapsed > 0 ? (msgCount - lastMessageSample) / elapsed : 0;

    diagState.latency = (5 + Math.random() * 20 + robots.length * 1.5).toFixed(1);
    diagState.throughput = Math.max(0, delta).toFixed(1);
    diagState.health = robots.length > topics.length + nodes.length ? '⚠️ İzleme' : '✅ İyi';

    lastMessageSample = msgCount;
    lastDiagSample = now;
    lastDiagUpdate = now;

    updateDiagnosticsPanel();
}

function updateDiagnosticsPanel() {
    const latencyEl = document.getElementById('diagLatency');
    const throughputEl = document.getElementById('diagThroughput');
    const healthEl = document.getElementById('diagHealth');
    if (!latencyEl || !throughputEl || !healthEl) {
        return;
    }
    latencyEl.textContent = `${diagState.latency} ms`;
    throughputEl.textContent = `${diagState.throughput} msg/s`;
    healthEl.textContent = diagState.health;
}

function spawnRobotWithDefaults(robotType = 'turtlebot') {
    if (!canvas) {
        return;
    }
    const name = `${robotType}_${Math.floor(Math.random() * 1000)}`;
    const x = canvas.width / 2 + (Math.random() - 0.5) * 250;
    const y = canvas.height / 2 + (Math.random() - 0.5) * 250;
    simulator.add_robot(name, robotType, x, y);
    updateRobotsList();
    pushConsole(`${name} komut paleti ile oluşturuldu`, 'success');
}

window.openCommandPalette = openCommandPalette;
window.activateTab = activateTab;
window.sendPlaybookCommand = sendPlaybookCommand;
