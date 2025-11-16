use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::f64::consts::PI;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

/// Representation of a ROS2 node exposed to the UI.
#[derive(Serialize, Deserialize, Clone)]
pub struct Ros2Node {
    pub name: String,
    pub node_type: String,
    pub x: f64,
    pub y: f64,
}

/// ROS2 topic metadata for visualization.
#[derive(Serialize, Deserialize, Clone)]
pub struct Ros2Topic {
    pub name: String,
    pub msg_type: String,
    pub publishers: Vec<String>,
    pub subscribers: Vec<String>,
}

/// Lightweight ROS2 message log entry used in the UI.
#[derive(Serialize, Deserialize, Clone)]
pub struct Ros2Message {
    pub topic: String,
    pub data: String,
    pub timestamp: f64,
}

/// Robot entity simulated on the 2D canvas.
#[derive(Serialize, Deserialize, Clone)]
pub struct Robot {
    pub name: String,
    pub robot_type: String,
    pub x: f64,
    pub y: f64,
    pub theta: f64,
    pub linear_vel: f64,
    pub angular_vel: f64,
    pub width: f64,
    pub height: f64,
}

/// Simple geometric obstacle used to populate the playground.
#[derive(Serialize, Deserialize, Clone)]
pub struct Obstacle {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub shape: String, // "rectangle" or "circle"
}

const DELTA_TIME_STEP: f64 = 0.016;
const LINEAR_FAST: f64 = 60.0;
const LINEAR_REVERSE: f64 = -40.0;
const ANGULAR_FAST: f64 = 1.2;

impl Robot {
    fn integrate(&mut self, delta_time: f64) {
        self.theta += self.angular_vel * delta_time;
        self.x += self.linear_vel * self.theta.cos() * delta_time;
        self.y += self.linear_vel * self.theta.sin() * delta_time;
        Self::wrap_angle(&mut self.theta);
    }

    fn wrap_angle(angle: &mut f64) {
        while *angle > PI {
            *angle -= 2.0 * PI;
        }
        while *angle < -PI {
            *angle += 2.0 * PI;
        }
    }

    fn apply_action_profile(&mut self, action: &str) -> bool {
        match action {
            "forward" => {
                self.linear_vel = LINEAR_FAST;
                self.angular_vel = 0.0;
            }
            "backward" => {
                self.linear_vel = LINEAR_REVERSE;
                self.angular_vel = 0.0;
            }
            "left" => {
                self.linear_vel = 0.0;
                self.angular_vel = ANGULAR_FAST;
            }
            "right" => {
                self.linear_vel = 0.0;
                self.angular_vel = -ANGULAR_FAST;
            }
            "stop" => {
                self.linear_vel = 0.0;
                self.angular_vel = 0.0;
            }
            _ => return false,
        }
        true
    }
}

/// Primary simulation state shared with the WebAssembly front-end.
#[wasm_bindgen]
pub struct Ros2Simulator {
    nodes: HashMap<String, Ros2Node>,
    topics: HashMap<String, Ros2Topic>,
    messages: Vec<Ros2Message>,
    robots: HashMap<String, Robot>,
    obstacles: Vec<Obstacle>,
    last_update: f64,
}

#[wasm_bindgen]
impl Ros2Simulator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Ros2Simulator {
        console_log!("ROS2 Simulator initialized!");
        Ros2Simulator {
            nodes: HashMap::new(),
            topics: HashMap::new(),
            messages: Vec::new(),
            robots: HashMap::new(),
            obstacles: Vec::new(),
            last_update: 0.0,
        }
    }

    pub fn add_node(&mut self, name: String, node_type: String, x: f64, y: f64) {
        console_log!("Adding node: {}", name);
        self.nodes.insert(
            name.clone(),
            Ros2Node {
                name,
                node_type,
                x,
                y,
            },
        );
    }

    pub fn add_topic(&mut self, name: String, msg_type: String) {
        console_log!("Adding topic: {}", name);
        self.topics.insert(
            name.clone(),
            Ros2Topic {
                name,
                msg_type,
                publishers: Vec::new(),
                subscribers: Vec::new(),
            },
        );
    }

    pub fn publish(&mut self, node_name: String, topic_name: String) -> Result<(), JsValue> {
        if !self.nodes.contains_key(&node_name) {
            return Err(JsValue::from_str("Node not found"));
        }

        if let Some(topic) = self.topics.get_mut(&topic_name) {
            if !topic.publishers.contains(&node_name) {
                topic.publishers.push(node_name);
            }
            Ok(())
        } else {
            Err(JsValue::from_str("Topic not found"))
        }
    }

    pub fn subscribe(&mut self, node_name: String, topic_name: String) -> Result<(), JsValue> {
        if !self.nodes.contains_key(&node_name) {
            return Err(JsValue::from_str("Node not found"));
        }

        if let Some(topic) = self.topics.get_mut(&topic_name) {
            if !topic.subscribers.contains(&node_name) {
                topic.subscribers.push(node_name);
            }
            Ok(())
        } else {
            Err(JsValue::from_str("Topic not found"))
        }
    }

    pub fn send_message(&mut self, topic: String, data: String, timestamp: f64) {
        self.messages.push(Ros2Message {
            topic: topic.clone(),
            data,
            timestamp,
        });
        console_log!("Message sent on topic: {}", topic);
    }

    pub fn get_nodes_json(&self) -> String {
        serde_json::to_string(&self.nodes.values().collect::<Vec<_>>()).unwrap_or_default()
    }

    pub fn get_topics_json(&self) -> String {
        serde_json::to_string(&self.topics.values().collect::<Vec<_>>()).unwrap_or_default()
    }

    pub fn get_messages_json(&self) -> String {
        serde_json::to_string(&self.messages).unwrap_or_default()
    }

    pub fn clear_messages(&mut self) {
        self.messages.clear();
    }

    pub fn get_node_count(&self) -> usize {
        self.nodes.len()
    }

    pub fn get_topic_count(&self) -> usize {
        self.topics.len()
    }

    pub fn reset(&mut self) {
        self.nodes.clear();
        self.topics.clear();
        self.messages.clear();
        self.robots.clear();
        self.obstacles.clear();
        console_log!("Simulator reset");
    }

    // Robot functions
    pub fn add_robot(&mut self, name: String, robot_type: String, x: f64, y: f64) {
        let (width, height) = match robot_type.as_str() {
            "turtlebot" => (40.0, 40.0),
            "differential" => (50.0, 50.0),
            "ackermann" => (60.0, 40.0),
            _ => (40.0, 40.0),
        };

        self.robots.insert(
            name.clone(),
            Robot {
                name,
                robot_type,
                x,
                y,
                theta: 0.0,
                linear_vel: 0.0,
                angular_vel: 0.0,
                width,
                height,
            },
        );
        console_log!("Robot added");
    }

    pub fn set_robot_velocity(&mut self, name: String, linear: f64, angular: f64) {
        if let Some(robot) = self.robots.get_mut(&name) {
            robot.linear_vel = linear;
            robot.angular_vel = angular;
            console_log!("Robot velocity set: {} linear={}, angular={}", name, linear, angular);
        }
    }

    pub fn update_robots(&mut self, dt: f64) {
        self.last_update = dt;
        for robot in self.robots.values_mut() {
            robot.integrate(DELTA_TIME_STEP);
        }
    }

    pub fn add_obstacle(&mut self, x: f64, y: f64, width: f64, height: f64, shape: String) {
        self.obstacles.push(Obstacle {
            x,
            y,
            width,
            height,
            shape,
        });
        console_log!("Obstacle added");
    }

    pub fn clear_obstacles(&mut self) {
        self.obstacles.clear();
        console_log!("All obstacles cleared");
    }

    pub fn get_robots_json(&self) -> String {
        serde_json::to_string(&self.robots.values().collect::<Vec<_>>()).unwrap_or_default()
    }

    pub fn get_obstacles_json(&self) -> String {
        serde_json::to_string(&self.obstacles).unwrap_or_default()
    }

    pub fn move_robot(&mut self, name: String, x: f64, y: f64) {
        if let Some(robot) = self.robots.get_mut(&name) {
            robot.x = x;
            robot.y = y;
        }
    }

    pub fn apply_action(&mut self, name: String, action: String) {
        let action_key = action.to_lowercase();
        if let Some(robot) = self.robots.get_mut(&name) {
            if robot.apply_action_profile(&action_key) {
                console_log!("Applied {} action to {}", action_key, name);
            }
        }
    }

    pub fn get_robot_count(&self) -> usize {
        self.robots.len()
    }
}

#[wasm_bindgen(start)]
pub fn main() {
    console_log!("ROS2 WASM Module Loaded!");
}
