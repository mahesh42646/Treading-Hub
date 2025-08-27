const fetch = require('node-fetch');

const API_BASE = 'http://localhost:9988';

async function verifyData() {
  console.log('🔍 Verifying seeded data accessibility...\n');

  const endpoints = [
    { name: 'Users', url: '/api/admin/users' },
    { name: 'Blogs', url: '/api/blogs' },
    { name: 'News', url: '/api/news' },
    { name: 'FAQs', url: '/api/faqs' },
    { name: 'Team', url: '/api/team' },
    { name: 'Plans', url: '/api/plans' },
    { name: 'Contacts', url: '/api/admin/contacts' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Checking ${endpoint.name}...`);
      const response = await fetch(`${API_BASE}${endpoint.url}`);
      
      if (response.ok) {
        const data = await response.json();
        const count = data[endpoint.name.toLowerCase()]?.length || data.users?.length || 0;
        console.log(`✅ ${endpoint.name}: ${count} items found`);
      } else {
        console.log(`❌ ${endpoint.name}: Failed (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
    }
  }

  console.log('\n🎯 Data verification completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Start the backend server: cd backend && npm start');
  console.log('   2. Start the frontend: npm run dev');
  console.log('   3. Access admin dashboard at: http://localhost:3000/admin');
  console.log('   4. View user pages at: http://localhost:3000/blog, /news, /faq, /about, /plans');
}

verifyData().catch(console.error);
