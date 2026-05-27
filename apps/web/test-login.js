// Test login functionality
async function testLogin() {
  try {
    const response = await fetch('http://localhost:8082/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@salonhub.com',
        password: 'admin123'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Login successful:', data);
      
      // Store in localStorage the way the AuthContext expects
      localStorage.setItem('salon_hub_access_token', data.access_token);
      localStorage.setItem('salon_hub_token_type', data.token_type || 'Bearer');
      localStorage.setItem('salon_hub_user_data', JSON.stringify({
        email: data.email,
        name: data.name,
        phoneNumber: data.phoneNumber,
        role: data.role,
        lastVisit: data.lastVisit
      }));
      
      // Set expiry to 1 hour from now
      const expiryTime = Date.now() + (3600 * 1000);
      localStorage.setItem('salon_hub_token_expiry', expiryTime.toString());
      
      console.log('Stored authentication data in localStorage');
      
      // Reload page to trigger auth state update
      window.location.reload();
    } else {
      console.error('Login failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}

testLogin();
