import { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, DollarSign, Bed, Bath, Maximize, Trash2, Search, LogOut, UserPlus, LogIn } from 'lucide-react';

function App() {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState('login');
  const [loading, setLoading] = useState(true);

  // Form states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [newProperty, setNewProperty] = useState({
    title: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    image: ''
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user
  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
      fetchProperties();
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  };

  // Fetch properties
  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', loginForm);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      setIsAuthenticated(true);
      setLoginForm({ username: '', password: '' });
      fetchProperties();
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', registerForm);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      setIsAuthenticated(true);
      setRegisterForm({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: ''
      });
      fetchProperties();
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    setProperties([]);
  };

  // Add property handler
  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/properties', {
        ...newProperty,
        price: Number(newProperty.price),
        bedrooms: Number(newProperty.bedrooms),
        bathrooms: Number(newProperty.bathrooms),
        area: Number(newProperty.area)
      });
      setNewProperty({
        title: '',
        price: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        image: ''
      });
      fetchProperties();
    } catch (error) {
      alert('Error adding property');
    }
  };

  // Delete property handler
  const handleDeleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(`/api/properties/${id}`);
        fetchProperties();
      } catch (error) {
        alert('Error deleting property');
      }
    }
  };

  // Filter properties
  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Authentication Forms
  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <Home size={48} className="text-primary mb-3" />
                    <h2 className="fw-bold">Real Estate Portal</h2>
                    <p className="text-muted">Experiment 9: With Authentication</p>
                  </div>

                  {showAuthForm === 'login' ? (
                    <form onSubmit={handleLogin}>
                      <h4 className="mb-3">Login</h4>
                      <div className="mb-3">
                        <label className="form-label">Username or Email</label>
                        <input
                          type="text"
                          className="form-control"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-100 mb-3">
                        <LogIn size={18} className="me-2" />
                        Login
                      </button>
                      <div className="text-center">
                        <span className="text-muted">Don't have an account? </span>
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() => setShowAuthForm('register')}
                        >
                          Register
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister}>
                      <h4 className="mb-3">Register</h4>
                      <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                          required
                          minLength={3}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={registerForm.fullName}
                          onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-100 mb-3">
                        <UserPlus size={18} className="me-2" />
                        Register
                      </button>
                      <div className="text-center">
                        <span className="text-muted">Already have an account? </span>
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() => setShowAuthForm('login')}
                        >
                          Login
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Application
  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand mb-0 h1">
            <Home className="me-2" size={24} />
            Real Estate Portal
          </span>
          <div className="d-flex align-items-center text-white">
            <span className="me-3">Welcome, {user?.fullName}</span>
            <button className="btn btn-light btn-sm" onClick={handleLogout}>
              <LogOut size={18} className="me-1" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Add Property Form */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Add New Property</h5>
            <form onSubmit={handleAddProperty}>
              <div className="row g-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Property Title"
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Price ($)"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Location"
                    value={newProperty.location}
                    onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Bedrooms"
                    value={newProperty.bedrooms}
                    onChange={(e) => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Bathrooms"
                    value={newProperty.bathrooms}
                    onChange={(e) => setNewProperty({ ...newProperty, bathrooms: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Area (sqft)"
                    value={newProperty.area}
                    onChange={(e) => setNewProperty({ ...newProperty, area: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="Image URL"
                    value={newProperty.image}
                    onChange={(e) => setNewProperty({ ...newProperty, image: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    Add Property
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="input-group">
              <span className="input-group-text">
                <Search size={20} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <h5 className="mb-3">Your Properties ({filteredProperties.length})</h5>
        {filteredProperties.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No properties found. Add your first property above!</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredProperties.map((property) => (
              <div key={property._id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <img
                    src={property.image}
                    className="card-img-top"
                    alt={property.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=Property+Image';
                    }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{property.title}</h5>
                    <p className="card-text text-muted mb-2">{property.location}</p>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-primary fw-bold">
                        <DollarSign size={18} />
                        {property.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="d-flex gap-3 text-muted small mb-3">
                      <span><Bed size={16} /> {property.bedrooms} Beds</span>
                      <span><Bath size={16} /> {property.bathrooms} Baths</span>
                      <span><Maximize size={16} /> {property.area} sqft</span>
                    </div>
                    <button
                      className="btn btn-danger btn-sm w-100"
                      onClick={() => handleDeleteProperty(property._id)}
                    >
                      <Trash2 size={16} className="me-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;