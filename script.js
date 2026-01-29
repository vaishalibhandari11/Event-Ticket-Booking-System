// Storage Keys
const EVENTS_KEY = 'en_events_demo_v1';
const USERS_KEY = 'en_users_demo_v1';
const BOOKINGS_KEY = 'en_bookings_demo_v1';
const QUERIES_KEY = 'en_queries_demo_v1';
const REVIEWS_KEY = 'en_reviews_demo_v1';
const NEWSLETTER_KEY = 'en_newsletter_v1';
const CURRENT_USER_KEY = 'en_current_user';
const CURRENT_PROVIDER_KEY = 'en_current_provider';

const ADMIN_EMAILS = ['admin@eventninjas.com'];

const API_BASE_URL = window.__EVENT_API_BASE__ || 'http://localhost:5000/api';
let firebaseAuthReady = false;
let firebaseUserInfo = null;

window.addEventListener('firebase-auth-ready', () => {
  firebaseAuthReady = true;
  refreshGoogleButtons();
});

window.addEventListener('firebase-auth-changed', (event) => {
  firebaseUserInfo = event.detail;
  if (firebaseUserInfo) {
    ensureUserExists(firebaseUserInfo);
    setCurrentUserSession(firebaseUserInfo.email, 'google');
  } else if (isGoogleProvider()) {
    clearCurrentSession();
  }
  updateNavbar();
  refreshGoogleButtons();
});

// Seed Events with more realistic data
const seedEvents = [
  { id: 1, title: 'Cricket Match: India vs Australia', venue: 'GEHU Football Ground', date: '2025-11-10', seats: 100, priceNormal: 50, priceVIP: 100, city: 'Dehradun', category: 'Sports', img: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=60', rating: 4.5, views: 234 },
  { id: 2, title: 'Grafest 2025', venue: 'GEHU Football Ground', date: '2025-12-12', seats: 150, priceNormal: 80, priceVIP: 150, city: 'Dehradun', category: 'Cultural', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1400&q=60', rating: 4.8, views: 512 },
  { id: 3, title: 'Rock Concert: The Legends Live', venue: 'City Music Hall', date: '2025-12-15', seats: 200, priceNormal: 100, priceVIP: 200, city: 'Dehradun', category: 'Music', img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=60', rating: 4.7, views: 389 },
  { id: 4, title: 'Tech Fest: Innovation Summit 2025', venue: 'GEHU Auditorium', date: '2025-12-18', seats: 120, priceNormal: 30, priceVIP: 60, city: 'Dehradun', category: 'Tech', img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=60', rating: 4.3, views: 178 },
  { id: 5, title: 'Dance Battle: Urban Moves Championship', venue: 'Central Hall', date: '2025-12-20', seats: 80, priceNormal: 40, priceVIP: 80, city: 'Dehradun', category: 'Dance', img: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=1400&q=60', rating: 4.6, views: 267 },
  { id: 6, title: 'Drama Night: Shakespeare Reimagined', venue: 'GEHU Cultural Stage', date: '2025-12-22', seats: 60, priceNormal: 35, priceVIP: 70, city: 'Dehradun', category: 'Theatre', img: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1400&q=60', rating: 4.4, views: 145 },
  { id: 7, title: 'EDM Night: DJ Pulse', venue: 'Open Air Arena', date: '2025-11-25', seats: 180, priceNormal: 120, priceVIP: 250, city: 'Dehradun', category: 'Music', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=60', rating: 4.9, views: 623 },
  { id: 8, title: 'Comedy Night: Stand-Up Showdown', venue: 'Laughter Club', date: '2025-11-28', seats: 90, priceNormal: 45, priceVIP: 90, city: 'Dehradun', category: 'Theatre', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1400&q=60', rating: 4.5, views: 298 },
];

// Initialize Storage
function initStorage() {
  if (!localStorage.getItem(EVENTS_KEY)) localStorage.setItem(EVENTS_KEY, JSON.stringify(seedEvents));
  if (!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY, JSON.stringify([]));
  if (!localStorage.getItem(BOOKINGS_KEY)) localStorage.setItem(BOOKINGS_KEY, JSON.stringify([]));
  if (!localStorage.getItem(QUERIES_KEY)) localStorage.setItem(QUERIES_KEY, JSON.stringify([]));
  if (!localStorage.getItem(REVIEWS_KEY)) localStorage.setItem(REVIEWS_KEY, JSON.stringify({}));
  if (!localStorage.getItem(NEWSLETTER_KEY)) localStorage.setItem(NEWSLETTER_KEY, JSON.stringify([]));
}
initStorage();

// Storage Functions
function getEvents() { return JSON.parse(localStorage.getItem(EVENTS_KEY)); }
function saveEvents(arr) { localStorage.setItem(EVENTS_KEY, JSON.stringify(arr)); }
function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY)); }
function saveUsers(arr) { localStorage.setItem(USERS_KEY, JSON.stringify(arr)); }
function getBookings() { return JSON.parse(localStorage.getItem(BOOKINGS_KEY)); }
function saveBookings(arr) { localStorage.setItem(BOOKINGS_KEY, JSON.stringify(arr)); }
function getQueries() { return JSON.parse(localStorage.getItem(QUERIES_KEY)); }
function saveQueries(arr) { localStorage.setItem(QUERIES_KEY, JSON.stringify(arr)); }
function getNewsletter() { return JSON.parse(localStorage.getItem(NEWSLETTER_KEY)); }
function saveNewsletter(arr) { localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(arr)); }
function getReviews() { return JSON.parse(localStorage.getItem(REVIEWS_KEY)); }
function saveReviews(obj) { localStorage.setItem(REVIEWS_KEY, JSON.stringify(obj)); }

function getCurrentUser() { 
  const userEmail = localStorage.getItem(CURRENT_USER_KEY);
  if (!userEmail) return null;
  const users = getUsers();
  return users.find(u => u.email === userEmail) || null;
}
function setCurrentUser(email) { localStorage.setItem(CURRENT_USER_KEY, email); }
function clearCurrentUser() { localStorage.removeItem(CURRENT_USER_KEY); }

function setCurrentUserSession(email, provider = 'local') {
  setCurrentUser(email);
  localStorage.setItem(CURRENT_PROVIDER_KEY, provider);
}

function getCurrentProvider() {
  return localStorage.getItem(CURRENT_PROVIDER_KEY) || 'local';
}

function clearCurrentSession() {
  clearCurrentUser();
  localStorage.removeItem(CURRENT_PROVIDER_KEY);
}

function isGoogleProvider() {
  return getCurrentProvider() === 'google';
}

function isAdminUser() {
  const user = getCurrentUser();
  if (!user) return false;
  if (ADMIN_EMAILS.includes(user.email)) {
    return true;
  }
  return isGoogleProvider();
}

function ensureUserExists(source) {
  if (!source || !source.email) {
    return null;
  }
  const users = getUsers();
  let user = users.find((u) => u.email === source.email);
  const nameFromSource = source.displayName || source.name || source.email.split('@')[0];
  const phoneFromSource = source.phoneNumber || source.phone || '';
  if (!user) {
    user = {
      name: nameFromSource,
      email: source.email,
      password: source.password || '__google__',
      phone: phoneFromSource,
      joinedDate: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
  } else {
    let mutated = false;
    if (nameFromSource && user.name !== nameFromSource) {
      user.name = nameFromSource;
      mutated = true;
    }
    if (phoneFromSource && user.phone !== phoneFromSource) {
      user.phone = phoneFromSource;
      mutated = true;
    }
    if (mutated) {
      saveUsers(users);
    }
  }
  return user;
}

function refreshGoogleButtons() {
  const buttons = document.querySelectorAll('[data-google-signin]');
  const disabled = !firebaseAuthReady || !!getCurrentUser();
  buttons.forEach((btn) => {
    if (!btn) return;
    const inlineDisplay = btn.dataset.inline || btn.dataset.inlineDisplay || btn.dataset.inlineStyle || '';
    if (disabled) {
      if (btn.dataset.hideWhenDisabled === 'true') {
        btn.style.display = 'none';
      }
      btn.disabled = true;
    } else {
      if (btn.dataset.hideWhenDisabled === 'true') {
        btn.style.display = inlineDisplay || 'inline-block';
      } else if (inlineDisplay) {
        btn.style.display = inlineDisplay;
      }
      btn.disabled = false;
    }
  });
}

function normalizeServerEvent(item) {
  if (!item) {
    return null;
  }
  const dateValue = item.date ? new Date(item.date) : new Date();
  return {
    id: item.id,
    title: item.title || 'Untitled Event',
    venue: item.venue || 'TBA',
    date: dateValue.toISOString().split('T')[0],
    seats: Number(item.seats) || 0,
    priceNormal: Number(item.priceNormal) || 0,
    priceVIP: Number(item.priceVIP) || Number(item.priceNormal) || 0,
    city: item.city || 'Unknown',
    category: item.category || 'General',
    img: item.img || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60',
    rating: item.rating ?? 4.5,
    views: item.views ?? 0,
  };
}

async function fetchEventsFromServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (payload.success && Array.isArray(payload.data)) {
      const normalized = payload.data
        .map(normalizeServerEvent)
        .filter(Boolean);
      if (normalized.length > 0) {
        saveEvents(normalized);
      }
    }
  } catch (err) {
    console.warn('Failed to fetch events from server:', err.message);
  }

  refreshGoogleButtons();
}

async function createEventOnServer(eventData) {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (payload.success && payload.data) {
      return payload.data;
    }
  } catch (err) {
    console.warn('Failed to create event on server:', err.message);
    throw err;
  }
  throw new Error('Unknown server response');
}

async function deleteEventOnServer(eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    return !!payload.success;
  } catch (err) {
    console.warn('Failed to delete event on server:', err.message);
    throw err;
  }
}

function getNextEventId() {
  const events = getEvents();
  if (!events.length) {
    return 1;
  }
  return (
    events
      .map((ev) => Number(ev.id) || 0)
      .reduce((max, id) => (id > max ? id : max), 0) + 1
  );
}

function resetEventForm() {
  const form = document.getElementById('eventForm');
  if (!form) return;
  form.reset();
  const today = new Date();
  const defaultDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const dateField = document.getElementById('newEventDate');
  if (dateField && !dateField.value) {
    dateField.value = defaultDate;
  }
}

function renderManageEventsList() {
  const listContainer = document.getElementById('manageEventsList');
  if (!listContainer) {
    return;
  }

  const events = getEvents()
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!events.length) {
    listContainer.innerHTML = '<p class="muted">No events found. Add a new event above.</p>';
    return;
  }

  listContainer.innerHTML = events
    .map(
      (ev) => `
        <div class="booking-item">
          <h4 style="color:var(--accent);margin:0 0 8px 0">${ev.title}</h4>
          <div class="small-muted">${ev.venue} • ${ev.city}</div>
          <div class="small-muted">📅 ${ev.date}</div>
          <div class="small-muted">🎟 Seats: ${ev.seats}</div>
          <div class="small-muted">💰 ₹${ev.priceNormal} - ₹${ev.priceVIP}</div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            <span class="badge badge-info">${ev.category}</span>
            <button class="btn-ghost" style="padding:4px 8px;font-size:0.85rem" onclick="deleteEventById(${ev.id})">Remove</button>
          </div>
        </div>
      `
    )
    .join('');
}

async function submitEventForm() {
  const msgEl = document.getElementById('manageEventMsg');
  if (msgEl) {
    msgEl.textContent = '';
  }

  const title = document.getElementById('newEventTitle')?.value.trim();
  const venue = document.getElementById('newEventVenue')?.value.trim();
  const date = document.getElementById('newEventDate')?.value;
  const seats = Number(document.getElementById('newEventSeats')?.value || 0);
  const priceNormal = Number(document.getElementById('newEventPriceNormal')?.value || 0);
  const priceVIP = Number(document.getElementById('newEventPriceVIP')?.value || priceNormal);
  const city = document.getElementById('newEventCity')?.value.trim();
  const category = document.getElementById('newEventCategory')?.value || 'General';
  const img = document.getElementById('newEventImage')?.value.trim();

  if (!title || !venue || !date || !city) {
    if (msgEl) {
      msgEl.innerHTML = '<span class="error-msg">Please fill in all required fields.</span>';
    }
    return;
  }

  if (seats <= 0 || priceNormal < 0 || priceVIP < 0) {
    if (msgEl) {
      msgEl.innerHTML = '<span class="error-msg">Seats and prices must be positive values.</span>';
    }
    return;
  }

  const fallbackId = getNextEventId();

  const baseEvent = {
    id: fallbackId,
    title,
    venue,
    date,
    seats,
    priceNormal,
    priceVIP,
    city,
    category,
    img,
  };

  let savedEvent = null;
  let serverSynced = false;

  try {
    const serverPayload = await createEventOnServer(baseEvent);
    if (serverPayload) {
      savedEvent = normalizeServerEvent(serverPayload);
      serverSynced = true;
    }
  } catch (err) {
    console.warn('Server event creation failed, falling back to local storage.');
  }

  if (!savedEvent) {
    savedEvent = normalizeServerEvent(baseEvent);
  }

  const events = getEvents();
  const existingIndex = events.findIndex((ev) => Number(ev.id) === Number(savedEvent.id));
  if (existingIndex >= 0) {
    events[existingIndex] = savedEvent;
  } else {
    events.push(savedEvent);
  }
  saveEvents(events);

  renderEvents();
  renderManageEventsList();
  resetEventForm();

  if (msgEl) {
    msgEl.innerHTML = `<span class="success-msg">Event ${serverSynced ? 'created' : 'saved locally'} successfully!</span>`;
  }
  showToast(serverSynced ? 'Event created successfully!' : 'Event saved locally (offline mode).', serverSynced ? 'success' : 'info');
}

async function deleteEventById(eventId) {
  if (!isAdminUser()) {
    showToast('You do not have permission to remove events.', 'error');
    return;
  }

  if (!confirm('Are you sure you want to remove this event?')) {
    return;
  }

  let serverSynced = false;
  try {
    serverSynced = await deleteEventOnServer(eventId);
  } catch (err) {
    console.warn('Server event deletion failed, removing locally.');
  }

  const events = getEvents().filter((ev) => Number(ev.id) !== Number(eventId));
  saveEvents(events);

  renderEvents();
  renderManageEventsList();

  showToast(serverSynced ? 'Event removed successfully!' : 'Event removed locally.', serverSynced ? 'success' : 'info');
}

// Toast Notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// Update Navbar
function updateNavbar() {
  const user = getCurrentUser();
  const loggedAs = document.getElementById('loggedAs');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const profileBtn = document.getElementById('profileBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const googleBtn = document.getElementById('googleBtn');
  const manageBtn = document.getElementById('manageEventsBtn');

  if (user) {
    const displayName = firebaseUserInfo?.displayName || user.name;
    loggedAs.textContent = `Hi, ${displayName} 👋`;
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    profileBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'inline-block';
    if (googleBtn) {
      googleBtn.style.display = 'none';
      googleBtn.disabled = false;
    }
    if (manageBtn) {
      manageBtn.style.display = isAdminUser() ? 'inline-block' : 'none';
    }
  } else {
    loggedAs.textContent = '';
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    profileBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
    if (manageBtn) {
      manageBtn.style.display = 'none';
    }
    if (googleBtn) {
      if (firebaseAuthReady) {
        googleBtn.style.display = 'inline-block';
        googleBtn.disabled = false;
      } else {
        googleBtn.style.display = 'none';
        googleBtn.disabled = true;
      }
    }
  }
}

// Registration
function register() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const phone = document.getElementById('regPhone').value.trim();
  const msgEl = document.getElementById('regMsg');

  if (!name || !email || !password || !phone) {
    msgEl.innerHTML = '<span class="error-msg">All fields are required</span>';
    return;
  }

  if (password.length < 6) {
    msgEl.innerHTML = '<span class="error-msg">Password must be at least 6 characters</span>';
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    msgEl.innerHTML = '<span class="error-msg">Please enter a valid 10-digit phone number</span>';
    return;
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    msgEl.innerHTML = '<span class="error-msg">Email already registered</span>';
    return;
  }

  users.push({ 
    name, 
    email, 
    password, 
    phone,
    joinedDate: new Date().toISOString(),
    securityQuestion: 'What is your favorite event?',
    securityAnswer: 'concert'
  });
  saveUsers(users);
  msgEl.innerHTML = '<span class="success-msg">Registration successful! Please login.</span>';
  showToast('Registration successful!', 'success');
  
  setTimeout(() => {
    closeModal();
    openModal('login');
  }, 1500);
}

// Login
function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const msgEl = document.getElementById('loginMsg');

  if (!email || !password) {
    msgEl.innerHTML = '<span class="error-msg">Email and password required</span>';
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    msgEl.innerHTML = '<span class="error-msg">Invalid credentials</span>';
    return;
  }

  setCurrentUserSession(email, 'local');
  updateNavbar();
  msgEl.innerHTML = '<span class="success-msg">Login successful!</span>';
  showToast(`Welcome back, ${user.name}!`, 'success');
  
  setTimeout(() => {
    closeModal();
    renderEvents();
  }, 1000);
}

// Logout
function logout() {
  if (isGoogleProvider() && window.firebaseAuthSignOut) {
    window.firebaseAuthSignOut()
      .then(() => {
        showToast('Logged out successfully!', 'info');
      })
      .catch((err) => {
        console.warn('Failed to sign out from Google:', err?.message || err);
        showToast('Google logout failed. Try again.', 'error');
      });
    return;
  }

  clearCurrentSession();
  updateNavbar();
  renderEvents();
  showToast('Logged out successfully!', 'info');
}

function loginWithGoogle() {
  const googleBtn = document.getElementById('googleBtn');
  if (window.location.protocol === 'file:') {
    showToast('Google sign-in requires running over http/https. Please use a local dev server.', 'error');
    return;
  }
  if (!firebaseAuthReady) {
    showToast('Google sign-in not ready yet. Please try again shortly.', 'error');
    return;
  }
  if (!window.firebaseAuthSignIn) {
    showToast('Google authentication is unavailable.', 'error');
    return;
  }

  if (googleBtn) {
    googleBtn.disabled = true;
  }

  window.firebaseAuthSignIn()
    .then(() => {
      showToast('Signed in with Google!', 'success');
      closeModal();
    })
    .catch((err) => {
      console.warn('Google sign-in failed:', err?.message || err);
      if (err?.code === 'auth/unauthorized-domain') {
        showToast('Authorize this domain in Firebase console (Authentication → Settings → Authorized domains).', 'error');
      } else {
        showToast('Google sign-in failed. Please try again.', 'error');
      }
    })
    .finally(() => {
      if (googleBtn) {
        googleBtn.disabled = false;
      }
      refreshGoogleButtons();
    });
}

// Forgot Password
function forgotPassword() {
  closeModal();
  openModal('forgot');
}

function sendResetCode() {
  const email = document.getElementById('forgotEmail').value.trim();
  const msgEl = document.getElementById('forgotMsg');

  if (!email) {
    msgEl.innerHTML = '<span class="error-msg">Email is required</span>';
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    msgEl.innerHTML = '<span class="error-msg">Email not found</span>';
    return;
  }

  // Generate a 6-digit code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store reset code temporarily (in real app, send via email)
  localStorage.setItem('reset_code_' + email, resetCode);
  localStorage.setItem('reset_code_time_' + email, Date.now());

  msgEl.innerHTML = '<span class="success-msg">Reset code sent! (Demo: ' + resetCode + ')</span>';
  
  setTimeout(() => {
    openModal('reset');
    document.getElementById('resetEmail').value = email;
  }, 2000);
}

function resetPassword() {
  const email = document.getElementById('resetEmail').value.trim();
  const code = document.getElementById('resetCode').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const msgEl = document.getElementById('resetMsg');

  if (!code || !newPassword || !confirmPassword) {
    msgEl.innerHTML = '<span class="error-msg">All fields are required</span>';
    return;
  }

  if (newPassword !== confirmPassword) {
    msgEl.innerHTML = '<span class="error-msg">Passwords do not match</span>';
    return;
  }

  if (newPassword.length < 6) {
    msgEl.innerHTML = '<span class="error-msg">Password must be at least 6 characters</span>';
    return;
  }

  const storedCode = localStorage.getItem('reset_code_' + email);
  const codeTime = parseInt(localStorage.getItem('reset_code_time_' + email));

  // Check if code expired (10 minutes)
  if (Date.now() - codeTime > 600000) {
    msgEl.innerHTML = '<span class="error-msg">Reset code expired. Please request a new one.</span>';
    localStorage.removeItem('reset_code_' + email);
    localStorage.removeItem('reset_code_time_' + email);
    return;
  }

  if (code !== storedCode) {
    msgEl.innerHTML = '<span class="error-msg">Invalid reset code</span>';
    return;
  }

  // Update password
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  users[userIndex].password = newPassword;
  saveUsers(users);

  // Clear reset code
  localStorage.removeItem('reset_code_' + email);
  localStorage.removeItem('reset_code_time_' + email);

  msgEl.innerHTML = '<span class="success-msg">Password reset successful! Please login.</span>';
  showToast('Password reset successful!', 'success');

  setTimeout(() => {
    closeModal();
    openModal('login');
  }, 1500);
}

// Event Card HTML
function eventCardHTML(ev) {
  const bookedSeats = getBookings()
    .filter(b => b.eventId === ev.id && b.status === 'confirmed')
    .reduce((sum, b) => sum + b.seats, 0);
  const availableSeats = ev.seats - bookedSeats;
  const reviews = getReviews()[ev.id] || [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : ev.rating;

  return `
  <div class="card">
    <div class="thumb" style="background-image:url('${ev.img}')">
      <span class="category-badge">${ev.category}</span>
      ${availableSeats < 20 ? '<span class="limited-badge">Limited Seats</span>' : ''}
    </div>
    <div class="body">
      <h3>${ev.title}</h3>
      <div class="muted">${ev.venue} • ${ev.city}</div>
      <div class="small-muted">📅 ${ev.date}</div>
      <div class="rating">
        ${'⭐'.repeat(Math.floor(avgRating))} ${avgRating} (${reviews.length} reviews)
      </div>
      <div class="info-row">
        <span class="small-muted">Available: ${availableSeats}/${ev.seats}</span>
        <span class="small-muted">₹${ev.priceNormal} - ₹${ev.priceVIP}</span>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn" onclick="bookEvent(${ev.id})">Book Now</button>
        <button class="btn-ghost" onclick="viewEventDetails(${ev.id})">Details</button>
      </div>
    </div>
  </div>`;
}

// Render Events with filters
function renderEvents() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortFilter').value;
  const grid = document.getElementById('eventsGrid');
  
  let arr = getEvents().filter(e => {
    const matchSearch = !q || 
      e.title.toLowerCase().includes(q) || 
      e.city.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q);
    const matchCategory = !category || e.category === category;
    return matchSearch && matchCategory;
  });

  // Sorting
  if (sort === 'price-low') {
    arr.sort((a, b) => a.priceNormal - b.priceNormal);
  } else if (sort === 'price-high') {
    arr.sort((a, b) => b.priceNormal - a.priceNormal);
  } else if (sort === 'popularity') {
    arr.sort((a, b) => b.views - a.views);
  } else {
    arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  grid.innerHTML = arr.length > 0 ? arr.map(eventCardHTML).join('') : '<p class="muted">No events found</p>';
  document.getElementById('year').innerText = new Date().getFullYear();
}

// Book Event
function bookEvent(eventId) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to book events', 'error');
    openModal('login');
    return;
  }

  const events = getEvents();
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  const bookedSeats = getBookings()
    .filter(b => b.eventId === eventId && b.status === 'confirmed')
    .reduce((sum, b) => sum + b.seats, 0);
  const availableSeats = event.seats - bookedSeats;

  if (availableSeats <= 0) {
    showToast('Sorry, this event is fully booked!', 'error');
    return;
  }

  openModal('booking');
  const card = document.getElementById('modalCard');
  card.innerHTML = `
    <h3>Book: ${event.title}</h3>
    <div class="muted">${event.venue} • ${event.date}</div>
    <div class="small-muted" style="margin-top:8px">Available seats: ${availableSeats}</div>
    
    <div style="margin-top:16px">
      <label class="muted">Ticket Type</label>
      <select id="ticketType" class="input" onchange="updateBookingPrice()">
        <option value="normal">Normal - ₹${event.priceNormal}</option>
        <option value="vip">VIP - ₹${event.priceVIP}</option>
      </select>

      <label class="muted">Number of Seats</label>
      <input type="number" id="bookSeats" class="input" min="1" max="${availableSeats}" value="1" oninput="updateBookingPrice()" />

      <div id="totalPrice" class="muted" style="margin-top:10px;font-size:1.1rem;font-weight:600">Total: ₹${event.priceNormal}</div>

      <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" onclick="confirmBooking(${eventId})">Proceed to Payment</button>
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      </div>
      <div id="bookingMsg"></div>
    </div>
  `;
}

function updateBookingPrice() {
  const eventId = parseInt(document.getElementById('modalCard').querySelector('button[onclick^="confirmBooking"]').getAttribute('onclick').match(/\d+/)[0]);
  const event = getEvents().find(e => e.id === eventId);
  const type = document.getElementById('ticketType').value;
  const seats = parseInt(document.getElementById('bookSeats').value) || 1;
  const price = type === 'vip' ? event.priceVIP : event.priceNormal;
  document.getElementById('totalPrice').textContent = `Total: ₹${price * seats}`;
}

function confirmBooking(eventId) {
  const user = getCurrentUser();
  const event = getEvents().find(e => e.id === eventId);
  const type = document.getElementById('ticketType').value;
  const seats = parseInt(document.getElementById('bookSeats').value);
  const msgEl = document.getElementById('bookingMsg');

  if (!seats || seats < 1) {
    msgEl.innerHTML = '<span class="error-msg">Invalid number of seats</span>';
    return;
  }

  const bookedSeats = getBookings()
    .filter(b => b.eventId === eventId && b.status === 'confirmed')
    .reduce((sum, b) => sum + b.seats, 0);
  const availableSeats = event.seats - bookedSeats;

  if (seats > availableSeats) {
    msgEl.innerHTML = '<span class="error-msg">Not enough seats available</span>';
    return;
  }

  const price = type === 'vip' ? event.priceVIP : event.priceNormal;
  const total = price * seats;

  // Show payment modal
  openModal('payment');
  const card = document.getElementById('modalCard');
  card.innerHTML = `
    <h3>💳 Payment</h3>
    <div class="payment-summary">
      <div class="info-row">
        <span>Event:</span>
        <span>${event.title}</span>
      </div>
      <div class="info-row">
        <span>Ticket Type:</span>
        <span>${type.toUpperCase()}</span>
      </div>
      <div class="info-row">
        <span>Seats:</span>
        <span>${seats}</span>
      </div>
      <div class="info-row">
        <span>Price per seat:</span>
        <span>₹${price}</span>
      </div>
      <hr style="border-color:rgba(255,255,255,0.1)">
      <div class="info-row" style="font-weight:700;font-size:1.1rem">
        <span>Total Amount:</span>
        <span style="color:var(--accent)">₹${total}</span>
      </div>
    </div>

    <div style="margin-top:20px">
      <label class="muted">Payment Method</label>
      <select id="paymentMethod" class="input">
        <option value="card">Credit/Debit Card</option>
        <option value="upi">UPI</option>
        <option value="netbanking">Net Banking</option>
      </select>

      <div id="cardDetails" style="margin-top:12px">
        <input type="text" class="input" placeholder="Card Number" maxlength="16" />
        <div class="row">
          <input type="text" class="input" placeholder="MM/YY" maxlength="5" />
          <input type="text" class="input" placeholder="CVV" maxlength="3" />
        </div>
      </div>

      <div style="margin-top:16px;display:flex;gap:10px">
        <button class="btn" onclick="processPayment(${eventId}, '${type}', ${seats}, ${total})">Pay ₹${total}</button>
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      </div>
      <div id="paymentMsg"></div>
    </div>
  `;
}

function processPayment(eventId, type, seats, total) {
  const msgEl = document.getElementById('paymentMsg');
  msgEl.innerHTML = '<span class="muted">Processing payment...</span>';

  // Simulate payment processing
  setTimeout(() => {
    const user = getCurrentUser();
    const event = getEvents().find(e => e.id === eventId);

    const booking = {
      id: Date.now(),
      eventId: eventId,
      eventTitle: event.title,
      userEmail: user.email,
      userName: user.name,
      ticketType: type,
      seats: seats,
      totalPrice: total,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      bookingCode: 'EN' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    const bookings = getBookings();
    bookings.push(booking);
    saveBookings(bookings);

    msgEl.innerHTML = '<span class="success-msg">Payment successful!</span>';
    showToast('Booking confirmed! Check your email for details.', 'success');
    
    setTimeout(() => {
      closeModal();
      renderEvents();
      showBookingConfirmation(booking);
    }, 1500);
  }, 2000);
}

function showBookingConfirmation(booking) {
  openModal('confirmation');
  const card = document.getElementById('modalCard');
  card.innerHTML = `
    <div style="text-align:center">
      <div style="font-size:4rem">✅</div>
      <h2 style="color:var(--accent);margin:16px 0">Booking Confirmed!</h2>
      <p class="muted">Your tickets have been booked successfully</p>
    </div>

    <div class="booking-details">
      <div class="info-row">
        <span>Booking Code:</span>
        <span style="color:var(--accent);font-weight:700">${booking.bookingCode}</span>
      </div>
      <div class="info-row">
        <span>Event:</span>
        <span>${booking.eventTitle}</span>
      </div>
      <div class="info-row">
        <span>Seats:</span>
        <span>${booking.seats}</span>
      </div>
      <div class="info-row">
        <span>Total Paid:</span>
        <span>₹${booking.totalPrice}</span>
      </div>
    </div>

    <div style="margin-top:20px;text-align:center">
      <p class="small-muted">A confirmation email has been sent to ${booking.userEmail}</p>
      <button class="btn" onclick="closeModal()">Done</button>
      <button class="btn-ghost" onclick="closeModal();showUpcoming()">View My Bookings</button>
    </div>
  `;
}

// View Event Details
function viewEventDetails(eventId) {
  const event = getEvents().find(e => e.id === eventId);
  if (!event) return;

  const bookedSeats = getBookings()
    .filter(b => b.eventId === eventId && b.status === 'confirmed')
    .reduce((sum, b) => sum + b.seats, 0);
  const availableSeats = event.seats - bookedSeats;
  const reviews = getReviews()[eventId] || [];

  openModal('details');
  const card = document.getElementById('modalCard');
  card.innerHTML = `
    <img src="${event.img}" style="width:100%;border-radius:8px;margin-bottom:12px" alt="${event.title}" />
    <h2>${event.title}</h2>
    <div class="muted" style="margin-bottom:8px">${event.venue}, ${event.city}</div>
    <span class="category-badge">${event.category}</span>
    <div class="small-muted" style="margin-top:8px">📅 Date: ${event.date}</div>
    <div class="small-muted">👁 ${event.views} views</div>
    
    <div style="margin-top:16px">
      <div class="info-row">
        <span>Total Seats:</span>
        <span>${event.seats}</span>
      </div>
      <div class="info-row">
        <span>Available:</span>
        <span style="color:${availableSeats < 20 ? '#ff4444' : '#44ff44'}">${availableSeats}</span>
      </div>
      <div class="info-row">
        <span>Normal Ticket:</span>
        <span>₹${event.priceNormal}</span>
      </div>
      <div class="info-row">
        <span>VIP Ticket:</span>
        <span>₹${event.priceVIP}</span>
      </div>
    </div>

    <div style="margin-top:20px">
      <h4>Reviews (${reviews.length})</h4>
      ${reviews.length > 0 ? reviews.slice(0, 3).map(r => `
        <div class="review-item">
          <div style="display:flex;justify-content:space-between">
            <strong>${r.userName}</strong>
            <span>${'⭐'.repeat(r.rating)}</span>
          </div>
          <p class="small-muted">${r.comment}</p>
        </div>
      `).join('') : '<p class="small-muted">No reviews yet</p>'}
    </div>

    <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn" onclick="closeModal();bookEvent(${eventId})">Book Now</button>
      <button class="btn-ghost" onclick="addReview(${eventId})">Write Review</button>
      <button class="btn-ghost" onclick="closeModal()">Close</button>
    </div>
  `;
}

// Add Review
function addReview(eventId) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to write a review', 'error');
    closeModal();
    openModal('login');
    return;
  }

  openModal('review');
  const card = document.getElementById('modalCard');
  card.innerHTML = `
    <h3>Write a Review</h3>
    <div style="margin:16px 0">
      <label class="muted">Rating</label>
      <div class="star-rating">
        ${[1,2,3,4,5].map(i => `<span class="star" onclick="selectRating(${i})">☆</span>`).join('')}
      </div>
      <input type="hidden" id="selectedRating" value="5" />
    </div>
    <label class="muted">Your Review</label>
    <textarea id="reviewComment" class="input" rows="4" placeholder="Share your experience..."></textarea>
    <div style="display:flex;gap:10px;margin-top:12px">
      <button class="btn" onclick="submitReview(${eventId})">Submit Review</button>
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
    <div id="reviewMsg"></div>
  `;
}

function selectRating(rating) {
  document.getElementById('selectedRating').value = rating;
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    star.textContent = index < rating ? '⭐' : '☆';
  });
}

function submitReview(eventId) {
  const user = getCurrentUser();
  const rating = parseInt(document.getElementById('selectedRating').value);
  const comment = document.getElementById('reviewComment').value.trim();
  const msgEl = document.getElementById('reviewMsg');

  if (!comment) {
    msgEl.innerHTML = '<span class="error-msg">Please write a review</span>';
    return;
  }

  const reviews = getReviews();
  if (!reviews[eventId]) reviews[eventId] = [];
  
  reviews[eventId].push({
    userName: user.name,
    userEmail: user.email,
    rating: rating,
    comment: comment,
    date: new Date().toISOString()
  });

  saveReviews(reviews);
  msgEl.innerHTML = '<span class="success-msg">Review submitted!</span>';
  showToast('Thank you for your review!', 'success');

  setTimeout(() => {
    closeModal();
    viewEventDetails(eventId);
  }, 1500);
}

// Show Upcoming Bookings
function showUpcoming() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to view your bookings', 'error');
    openModal('login');
    return;
  }

  const bookings = getBookings().filter(b => b.userEmail === user.email);
  
  openModal('upcoming');
  const card = document.getElementById('modalCard');
  
  if (bookings.length === 0) {
    card.innerHTML = `
      <h3>My Bookings</h3>
      <p class="muted">No bookings yet. Start booking events!</p>
      <button class="btn" onclick="closeModal()">Close</button>
    `;
    return;
  }

  const bookingsList = bookings.map(b => `
    <div class="booking-item">
      <h4 style="color:var(--accent);margin:0 0 8px 0">${b.eventTitle}</h4>
      <div class="small-muted">Booking Code: <strong>${b.bookingCode || 'N/A'}</strong></div>
      <div class="small-muted">
        Ticket Type: <span class="badge badge-${b.ticketType === 'vip' ? 'warning' : 'info'}">${b.ticketType.toUpperCase()}</span>
      </div>
      <div class="small-muted">Seats: ${b.seats}</div>
      <div class="small-muted">Total: ₹${b.totalPrice}</div>
      <div class="small-muted">Booked: ${new Date(b.bookingDate).toLocaleDateString()}</div>
      <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="badge badge-${b.status === 'confirmed' ? 'success' : 'danger'}">${b.status}</span>
        ${b.status === 'confirmed' ? `<button class="btn-ghost" style="padding:4px 8px;font-size:0.85rem" onclick="cancelBooking(${b.id})">Cancel</button>` : ''}
        ${b.status === 'confirmed' ? `<button class="btn-ghost" style="padding:4px 8px;font-size:0.85rem" onclick="downloadTicket(${b.id})">Download Ticket</button>` : ''}
      </div>
    </div>
  `).join('');

  card.innerHTML = `
    <h3>My Bookings</h3>
    <div style="max-height:400px;overflow-y:auto">${bookingsList}</div>
    <button class="btn" onclick="closeModal()" style="margin-top:16px">Close</button>
  `;
}

function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) {
    return;
  }

  const bookings = getBookings();
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  
  if (bookingIndex === -1) {
    showToast('Booking not found', 'error');
    return;
  }

  bookings[bookingIndex].status = 'cancelled';
  bookings[bookingIndex].cancelledDate = new Date().toISOString();
  
  saveBookings(bookings);
  
  showToast('Booking cancelled successfully! Refund will be processed in 5-7 days.', 'success');
  showUpcoming();
  renderEvents();
}

function downloadTicket(bookingId) {
  const booking = getBookings().find(b => b.id === bookingId);
  if (!booking) return;

  showToast('Ticket downloaded! (Demo - check console)', 'success');
  console.log('Ticket Details:', booking);
  // In real app, generate PDF here
}

// Show Categories
function showCategories() {
  openModal('categories');
  const card = document.getElementById('modalCard');
  
  const categories = [
    { name: 'Sports', icon: '⚽', count: getEvents().filter(e => e.category === 'Sports').length },
    { name: 'Music', icon: '🎵', count: getEvents().filter(e => e.category === 'Music').length },
    { name: 'Cultural', icon: '🎭', count: getEvents().filter(e => e.category === 'Cultural').length },
    { name: 'Tech', icon: '💻', count: getEvents().filter(e => e.category === 'Tech').length },
    { name: 'Dance', icon: '💃', count: getEvents().filter(e => e.category === 'Dance').length },
    { name: 'Theatre', icon: '🎬', count: getEvents().filter(e => e.category === 'Theatre').length },
  ];

  card.innerHTML = `
    <h3>Event Categories</h3>
    <div class="categories-grid">
      ${categories.map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat.name}')">
          <div style="font-size:3rem">${cat.icon}</div>
          <h4>${cat.name}</h4>
          <p class="small-muted">${cat.count} events</p>
        </div>
      `).join('')}
    </div>
    <button class="btn" onclick="closeModal()" style="margin-top:16px">Close</button>
  `;
}

function filterByCategory(category) {
  closeModal();
  document.getElementById('categoryFilter').value = category;
  renderEvents();
  showToast(`Showing ${category} events`, 'info');
}

function showHome() {
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = '';
  renderEvents();
}

// Newsletter
function subscribeNewsletter() {
  const email = document.getElementById('newsletterEmail').value.trim();
  const msgEl = document.getElementById('newsletterMsg');

  if (!email) {
    msgEl.innerHTML = '<span class="error-msg">Email is required</span>';
    return;
  }

  const newsletter = getNewsletter();
  if (newsletter.includes(email)) {
    msgEl.innerHTML = '<span class="error-msg">Email already subscribed</span>';
    return;
  }

  newsletter.push(email);
  saveNewsletter(newsletter);
  
  document.getElementById('newsletterEmail').value = '';
  msgEl.innerHTML = '<span class="success-msg">Subscribed successfully! 🎉</span>';
  showToast('Thank you for subscribing!', 'success');
  
  setTimeout(() => msgEl.innerHTML = '', 3000);
}

// Query Management
function submitQuery() {
  const name = document.getElementById('qname').value.trim();
  const email = document.getElementById('qemail').value.trim();
  const text = document.getElementById('qtext').value.trim();
  const msgEl = document.getElementById('queryMsg');

  if (!name || !email || !text) {
    msgEl.innerHTML = '<span class="error-msg">All fields are required</span>';
    return;
  }

  const query = {
    id: Date.now(),
    name,
    email,
    text,
    date: new Date().toISOString(),
    status: 'pending'
  };

  const queries = getQueries();
  queries.push(query);
  saveQueries(queries);

  document.getElementById('qname').value = '';
  document.getElementById('qemail').value = '';
  document.getElementById('qtext').value = '';
  
  msgEl.innerHTML = '<span class="success-msg">Query submitted successfully!</span>';
  showToast('Query submitted! We will respond soon.', 'success');
  setTimeout(() => msgEl.innerHTML = '', 3000);
}

function viewQueries() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to view your queries', 'error');
    openModal('login');
    return;
  }

  const queries = getQueries().filter(q => q.email === user.email);
  
  openModal('queries');
  const card = document.getElementById('modalCard');
  
  if (queries.length === 0) {
    card.innerHTML = `
      <h3>My Queries</h3>
      <p class="muted">No queries submitted yet.</p>
      <button class="btn" onclick="closeModal()">Close</button>
    `;
    return;
  }

  const queriesList = queries.map(q => `
    <div class="booking-item">
      <div class="small-muted">${new Date(q.date).toLocaleDateString()}</div>
      <p style="margin:8px 0">${q.text}</p>
      <span class="badge badge-warning">${q.status}</span>
    </div>
  `).join('');

  card.innerHTML = `
    <h3>My Queries</h3>
    <div style="max-height:400px;overflow-y:auto">${queriesList}</div>
    <button class="btn" onclick="closeModal()" style="margin-top:16px">Close</button>
  `;
}

// User Profile
function showProfile() {
  const user = getCurrentUser();
  if (!user) return;

  const bookings = getBookings().filter(b => b.userEmail === user.email);
  const totalSpent = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalPrice, 0);

  openModal('profile');
  const card = document.getElementById('modalCard');
  card.innerHTML = `
    <h3>My Profile</h3>
    <div class="profile-info">
      <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
      <h4>${user.name}</h4>
      <p class="small-muted">${user.email}</p>
      <p class="small-muted">📱 ${user.phone}</p>
      <p class="small-muted">Member since ${new Date(user.joinedDate).toLocaleDateString()}</p>
    </div>

    <div style="margin-top:20px">
      <h4>Account Statistics</h4>
      <div class="info-row">
        <span>Total Bookings:</span>
        <span>${bookings.length}</span>
      </div>
      <div class="info-row">
        <span>Active Bookings:</span>
        <span>${bookings.filter(b => b.status === 'confirmed').length}</span>
      </div>
      <div class="info-row">
        <span>Total Spent:</span>
        <span>₹${totalSpent}</span>
      </div>
    </div>

    <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn-ghost" onclick="editProfile()">Edit Profile</button>
      <button class="btn-ghost" onclick="changePassword()">Change Password</button>
      <button class="btn" onclick="closeModal()">Close</button>
    </div>
  `;
}

function editProfile() {
  const user = getCurrentUser();
  openModal('editProfile');
  const card = document.getElementById('modalCard');
  card.innerHTML = `
    <h3>Edit Profile</h3>
    <label class="muted">Name</label>
    <input type="text" id="editName" class="input" value="${user.name}" />
    <label class="muted">Phone</label>
    <input type="text" id="editPhone" class="input" value="${user.phone}" />
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn" onclick="saveProfile()">Save Changes</button>
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
    <div id="editProfileMsg"></div>
  `;
}

function saveProfile() {
  const user = getCurrentUser();
  const name = document.getElementById('editName').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const msgEl = document.getElementById('editProfileMsg');

  if (!name || !phone) {
    msgEl.innerHTML = '<span class="error-msg">All fields are required</span>';
    return;
  }

  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === user.email);
  users[userIndex].name = name;
  users[userIndex].phone = phone;
  saveUsers(users);

  msgEl.innerHTML = '<span class="success-msg">Profile updated!</span>';
  showToast('Profile updated successfully!', 'success');
  updateNavbar();

  setTimeout(() => {
    closeModal();
    showProfile();
  }, 1500);
}

function changePassword() {
  openModal('changePassword');
  const card = document.getElementById('modalCard');
  card.innerHTML = `
    <h3>Change Password</h3>
    <label class="muted">Current Password</label>
    <input type="password" id="currentPassword" class="input" />
    <label class="muted">New Password</label>
    <input type="password" id="newPasswordChange" class="input" />
    <label class="muted">Confirm New Password</label>
    <input type="password" id="confirmPasswordChange" class="input" />
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn" onclick="saveNewPassword()">Change Password</button>
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
    <div id="changePasswordMsg"></div>
  `;
}

function saveNewPassword() {
  const user = getCurrentUser();
  const current = document.getElementById('currentPassword').value;
  const newPass = document.getElementById('newPasswordChange').value;
  const confirm = document.getElementById('confirmPasswordChange').value;
  const msgEl = document.getElementById('changePasswordMsg');

  if (!current || !newPass || !confirm) {
    msgEl.innerHTML = '<span class="error-msg">All fields are required</span>';
    return;
  }

  if (user.password !== current) {
    msgEl.innerHTML = '<span class="error-msg">Current password is incorrect</span>';
    return;
  }

  if (newPass !== confirm) {
    msgEl.innerHTML = '<span class="error-msg">Passwords do not match</span>';
    return;
  }

  if (newPass.length < 6) {
    msgEl.innerHTML = '<span class="error-msg">Password must be at least 6 characters</span>';
    return;
  }

  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === user.email);
  users[userIndex].password = newPass;
  saveUsers(users);

  msgEl.innerHTML = '<span class="success-msg">Password changed successfully!</span>';
  showToast('Password changed successfully!', 'success');

  setTimeout(() => closeModal(), 1500);
}

// Modal Management
function openModal(kind) {
  const modal = document.getElementById('modal');
  const card = document.getElementById('modalCard');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  
  if (kind === 'login') {
    card.innerHTML = `
      <h3>Login</h3>
      <input id="loginEmail" class="input" type="email" placeholder="Email" />
      <input id="loginPassword" class="input" type="password" placeholder="Password" />
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" onclick="login()">Login</button>
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      </div>
      <button 
        type="button"
        class="btn-ghost"
        style="margin-top:10px"
        data-google-signin
        data-inline="inline-block"
        onclick="loginWithGoogle()"
      >Continue with Google</button>
      <div id="loginMsg"></div>
      <div class="small-muted" style="margin-top:12px">
        <a href="#" onclick="event.preventDefault();forgotPassword()" style="color:var(--accent)">Forgot Password?</a>
      </div>
      <div class="small-muted" style="margin-top:8px">
        Don't have an account? <a href="#" onclick="event.preventDefault();closeModal();openModal('register')" style="color:var(--accent)">Register</a>
      </div>
    `;
  } else if (kind === 'register') {
    card.innerHTML = `
      <h3>Register</h3>
      <input id="regName" class="input" placeholder="Full Name" />
      <input id="regEmail" class="input" type="email" placeholder="Email" />
      <input id="regPhone" class="input" type="tel" placeholder="Phone Number" maxlength="10" />
      <input id="regPassword" class="input" type="password" placeholder="Password (min 6 characters)" />
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" onclick="register()">Register</button>
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      </div>
      <button 
        type="button"
        class="btn-ghost"
        style="margin-top:10px"
        data-google-signin
        data-inline="inline-block"
        onclick="loginWithGoogle()"
      >Continue with Google</button>
      <div id="regMsg"></div>
      <div class="small-muted" style="margin-top:12px">
        Already have an account? <a href="#" onclick="event.preventDefault();closeModal();openModal('login')" style="color:var(--accent)">Login</a>
      </div>
    `;
  } else if (kind === 'manageEvents') {
    if (!isAdminUser()) {
      card.innerHTML = `
        <h3>Manage Events</h3>
        <p class="muted">Google sign-in is required with admin privileges to manage events.</p>
        <button class="btn" onclick="closeModal()" style="margin-top:16px">Close</button>
      `;
      return;
    }

    card.innerHTML = `
      <h3 style="color:var(--accent)">Manage Events</h3>
      <form id="eventForm" onsubmit="event.preventDefault(); submitEventForm();" class="card" style="padding:16px;margin-bottom:16px">
        <div class="row">
          <div style="flex:1;min-width:200px">
            <label class="muted" for="newEventTitle">Event Title</label>
            <input id="newEventTitle" class="input" placeholder="Amazing Event" required />
          </div>
          <div style="flex:1;min-width:200px">
            <label class="muted" for="newEventVenue">Venue</label>
            <input id="newEventVenue" class="input" placeholder="Venue name" required />
          </div>
        </div>
        <div class="row">
          <div style="flex:1;min-width:160px">
            <label class="muted" for="newEventCity">City</label>
            <input id="newEventCity" class="input" placeholder="City" required />
          </div>
          <div style="flex:1;min-width:160px">
            <label class="muted" for="newEventDate">Date</label>
            <input id="newEventDate" class="input" type="date" required />
          </div>
          <div style="flex:1;min-width:160px">
            <label class="muted" for="newEventCategory">Category</label>
            <select id="newEventCategory" class="input">
              <option value="Sports">Sports</option>
              <option value="Music">Music</option>
              <option value="Cultural">Cultural</option>
              <option value="Tech">Tech</option>
              <option value="Dance">Dance</option>
              <option value="Theatre">Theatre</option>
              <option value="General" selected>General</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div style="flex:1;min-width:160px">
            <label class="muted" for="newEventSeats">Total Seats</label>
            <input id="newEventSeats" class="input" type="number" min="1" value="100" />
          </div>
          <div style="flex:1;min-width:160px">
            <label class="muted" for="newEventPriceNormal">Normal Price (₹)</label>
            <input id="newEventPriceNormal" class="input" type="number" min="0" value="50" />
          </div>
          <div style="flex:1;min-width:160px">
            <label class="muted" for="newEventPriceVIP">VIP Price (₹)</label>
            <input id="newEventPriceVIP" class="input" type="number" min="0" value="100" />
          </div>
        </div>
        <label class="muted" for="newEventImage">Image URL</label>
        <input id="newEventImage" class="input" type="url" placeholder="https://..." />
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
          <button type="submit" class="btn">Add / Update Event</button>
          <button type="button" class="btn-ghost" onclick="resetEventForm()">Reset</button>
          <button type="button" class="btn-ghost" onclick="closeModal()">Close</button>
        </div>
        <div id="manageEventMsg" style="margin-top:10px"></div>
      </form>
      <div>
        <h4 style="margin-bottom:12px;color:var(--accent)">Existing Events</h4>
        <div id="manageEventsList" style="max-height:360px;overflow-y:auto"></div>
      </div>
    `;
    resetEventForm();
    renderManageEventsList();
  } else if (kind === 'forgot') {
    card.innerHTML = `
      <h3>Forgot Password</h3>
      <p class="muted">Enter your email to receive a reset code</p>
      <input id="forgotEmail" class="input" type="email" placeholder="Email" />
      <div style="display:flex;gap:10px;margin-top:16px">
        <button class="btn" onclick="sendResetCode()">Send Reset Code</button>
        <button class="btn-ghost" onclick="closeModal();openModal('login')">Back to Login</button>
      </div>
      <div id="forgotMsg"></div>
    `;
  } else if (kind === 'reset') {
    card.innerHTML = `
      <h3>Reset Password</h3>
      <p class="muted">Enter the code sent to your email</p>
      <input id="resetEmail" class="input" type="email" placeholder="Email" readonly />
      <input id="resetCode" class="input" type="text" placeholder="6-digit Reset Code" maxlength="6" />
      <input id="newPassword" class="input" type="password" placeholder="New Password" />
      <input id="confirmPassword" class="input" type="password" placeholder="Confirm Password" />
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        <button class="btn" onclick="resetPassword()">Reset Password</button>
        <button class="btn-ghost" onclick="forgotPassword()">Resend Code</button>
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      </div>
      <div id="resetMsg"></div>
    `;
  } else if (kind === 'profile') {
    showProfile();
  } else if (kind === 'terms') {
    card.innerHTML = `
      <h3>Terms & Conditions</h3>
      <div style="max-height:400px;overflow-y:auto">
        <p class="muted">Last updated: November 2025</p>
        <h4>1. Acceptance of Terms</h4>
        <p class="muted">This is a demo project for Data Structures course. No real transactions are processed.</p>
        <h4>2. Booking Policy</h4>
        <p class="muted">All bookings are subject to availability. Cancellations must be made 24 hours before the event.</p>
        <h4>3. Refund Policy</h4>
        <p class="muted">Refunds will be processed within 5-7 business days for cancelled bookings.</p>
        <h4>4. User Conduct</h4>
        <p class="muted">Users must provide accurate information and comply with event rules.</p>
      </div>
      <button class="btn" onclick="closeModal()" style="margin-top:16px">Close</button>
    `;
  } else if (kind === 'privacy') {
    card.innerHTML = `
      <h3>Privacy Policy</h3>
      <div style="max-height:400px;overflow-y:auto">
        <p class="muted">Last updated: November 2025</p>
        <h4>Data Collection</h4>
        <p class="muted">All data is stored locally in your browser using localStorage. No data is sent to any server.</p>
        <h4>Data Usage</h4>
        <p class="muted">We use your data only for booking management and improving user experience.</p>
        <h4>Data Security</h4>
        <p class="muted">Your data is stored securely in your browser and is not shared with third parties.</p>
        <h4>Your Rights</h4>
        <p class="muted">You can delete your data anytime by clearing your browser's localStorage.</p>
      </div>
      <button class="btn" onclick="closeModal()" style="margin-top:16px">Close</button>
    `;
  } else if (kind === 'about') {
    card.innerHTML = `
      <h3>About EventNinjas</h3>
      <div style="text-align:center;margin:20px 0">
        <div class="logo" style="width:80px;height:80px;margin:0 auto;font-size:2rem">EN</div>
      </div>
      <p class="muted">EventNinjas is a comprehensive event booking platform created as a Data Structures & Algorithms mini project.</p>
      <h4 style="margin-top:20px">Features:</h4>
      <ul class="muted" style="line-height:1.8">
        <li>User Authentication with Password Reset</li>
        <li>Event Browsing with Filters & Search</li>
        <li>Secure Booking System with Payment Gateway</li>
        <li>Booking Management & Cancellation</li>
        <li>Review & Rating System</li>
        <li>Query Management</li>
        <li>Newsletter Subscription</li>
        <li>User Profile Management</li>
      </ul>
      <p class="muted" style="margin-top:16px"><strong>Created by:</strong> Ridima Budhlakoti</p>
      <p class="muted"><strong>Institution:</strong> GEHU</p>
      <button class="btn" onclick="closeModal()" style="margin-top:16px">Close</button>
    `;
  } else if (kind === 'contact') {
    card.innerHTML = `
      <h3>Contact Us</h3>
      <p class="muted">Get in touch with us for any queries or support</p>
      <div style="margin-top:20px">
        <div class="info-row">
          <span>📧 Email:</span>
          <span>support@eventninjas.com</span>
        </div>
        <div class="info-row">
          <span>📱 Phone:</span>
          <span>+91 1234567890</span>
        </div>
        <div class="info-row">
          <span>📍 Address:</span>
          <span>GEHU, Dehradun</span>
        </div>
        <div class="info-row">
          <span>🕐 Hours:</span>
          <span>9 AM - 6 PM (Mon-Fri)</span>
        </div>
      </div>
      <button class="btn" onclick="closeModal()" style="margin-top:20px">Close</button>
    `;
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function closeModalIfBackground(e) {
  if (e.target.id === 'modal') closeModal();
}

// Initialize
updateNavbar();
renderEvents();
