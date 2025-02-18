module.exports = {
  apps: [{
    name: "session cleanup server",
    script: "./run_server.js",
    watch: false,
    ignore_watch: ["node_modules", "logs"],
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "development",
      PORT: 3000
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000
    },
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 4000
  }]
}
