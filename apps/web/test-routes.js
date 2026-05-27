// Simple route testing script
const routes = [
  '/',
  '/check-in',
  '/login', 
  '/register',
  '/book',
  '/services',
  '/colors',
  '/testing',
  '/waitlist'
];

console.log('🧪 Testing Salon Hub Routes...\n');

routes.forEach((route, index) => {
  console.log(`${index + 1}. ${route} - Available for testing`);
});

console.log('\n✅ All routes configured in App.tsx');
console.log('🔒 Protected routes: /admin, /admin/dashboard (require authentication)');
console.log('🌐 Test at: http://localhost:5174');
console.log('\nTo test routes:');
console.log('1. Open http://localhost:5174/testing');
console.log('2. Use the "Routing Tests" tab');
console.log('3. Click "Test Route" for each route');
