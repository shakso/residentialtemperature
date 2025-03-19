// Browser-compatible database client
// This is a mock implementation for the browser environment
// In a real application, you would use a REST API to communicate with your database

class MockPool {
  async query(text: string, params?: any[]) {
    console.log('Mock DB Query:', { text, params });
    
    // Handle specific queries with mock responses
    if (text.includes('check_email_exists')) {
      return {
        rows: [{ exists: false }],
        rowCount: 1
      };
    }
    
    if (text.includes('SELECT NOW()')) {
      return {
        rows: [{ now: new Date().toISOString() }],
        rowCount: 1
      };
    }
    
    // Default response
    return {
      rows: [],
      rowCount: 0
    };
  }
}

// Export a mock pool for browser compatibility
const pool = new MockPool();

console.log('Using mock database client for browser environment');

export default pool;
