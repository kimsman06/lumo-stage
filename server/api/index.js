const { app, connectDatabase } = require('../server/server');

let isConnected = false;

module.exports = async (req, res) => {
  // DB 연결이 없으면 연결 (Cold Start 시)
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return res.status(500).json({
        error: 'Database connection failed',
        message: error.message
      });
    }
  }

  // Express app에 요청 전달
  return app(req, res);
};
