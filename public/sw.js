
const CACHE_NAME = 'boinvit-mobile-v3';
const STATIC_CACHE = 'boinvit-static-v3';
const DYNAMIC_CACHE = 'boinvit-dynamic-v3';

// Static assets to cache
const staticAssets = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png',
  '/app/dashboard',
  '/app/services',
  '/app/bookings',
  '/app/clients',
  '/app/settings'
];

// API endpoints to cache
const dynamicAssets = [
  '/api/',
  'https://prfowczgawhjapsdpncq.supabase.co/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(staticAssets);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests
  if (request.url.includes('/api/') || request.url.includes('supabase.co')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached version if network fails
            return cache.match(request);
          });
      })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Fetch from network and cache
        return fetch(request)
          .then(response => {
            // Only cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('SW: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('SW: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png',
    badge: '/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Boinvit', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification click received');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/app/dashboard')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Get pending offline data from IndexedDB
    const pendingData = await getPendingOfflineData();
    
    for (const data of pendingData) {
      try {
        await syncDataToServer(data);
        await removePendingData(data.id);
      } catch (error) {
        console.log('SW: Failed to sync data:', error);
      }
    }
  } catch (error) {
    console.log('SW: Background sync failed:', error);
  }
}

// Helper functions for offline data management
async function getPendingOfflineData() {
  // Implement IndexedDB access for pending data
  return [];
}

async function syncDataToServer(data) {
  // Implement server sync logic
  return fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function removePendingData(id) {
  // Remove synced data from IndexedDB
  console.log('SW: Removing synced data:', id);
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
