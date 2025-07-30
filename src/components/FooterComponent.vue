<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid md:grid-cols-4 gap-8">
        <div class="md:col-span-2">
          <div class="flex items-center space-x-2 mb-4">
            <i class="fas fa-chair text-2xl text-blue-600 dark:text-blue-400"></i>
            <span class="text-xl font-bold text-gray-800 dark:text-white">SeatReserve</span>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            The modern way to reserve seats with ease, flexibility, and confidence. 
            Experience seamless booking for your perfect spot.
          </p>
        </div>
        
        <div>
          <h3 class="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider mb-4">
            Quick Links
          </h3>
          <ul class="space-y-2">
            <li><router-link to="/" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</router-link></li>
            <li><router-link to="/profile" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Profile</router-link></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider mb-4">
            Legal
          </h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
            <li><a href="#" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
        <p class="text-center text-gray-600 dark:text-gray-300 text-sm">
          © 2025 SeatReserve. All rights reserved. Built with care for better user experience.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer component with no special logic needed
</script> 