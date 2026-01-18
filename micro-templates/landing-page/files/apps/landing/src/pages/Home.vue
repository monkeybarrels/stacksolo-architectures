<script setup lang="ts">
const features = [
  {
    icon: '🚀',
    title: 'Lightning Fast',
    description: 'Built for speed with modern infrastructure that scales automatically.',
  },
  {
    icon: '🔒',
    title: 'Secure by Default',
    description: 'Enterprise-grade security with encryption at rest and in transit.',
  },
  {
    icon: '📊',
    title: 'Analytics Built-in',
    description: 'Understand your users with powerful, privacy-focused analytics.',
  },
  {
    icon: '🔌',
    title: 'Easy Integration',
    description: 'Connect with your favorite tools through our robust API.',
  },
  {
    icon: '💬',
    title: '24/7 Support',
    description: 'Our team is always here to help when you need us.',
  },
  {
    icon: '🌍',
    title: 'Global CDN',
    description: 'Your content delivered fast to users around the world.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'Perfect for side projects',
    features: ['Up to 1,000 users', '10GB storage', 'Email support', 'Basic analytics'],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing businesses',
    features: ['Up to 10,000 users', '100GB storage', 'Priority support', 'Advanced analytics', 'Custom domain', 'API access'],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large organizations',
    features: ['Unlimited users', '1TB storage', 'Dedicated support', 'Full analytics', 'SSO/SAML', 'SLA guarantee', 'Custom integrations'],
    highlighted: false,
    cta: 'Contact Sales',
  },
];
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center">
            <span class="text-xl font-bold text-gray-900">YourBrand</span>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" class="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="/login" class="text-gray-600 hover:text-gray-900">Sign in</a>
            <a
              href="/signup"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
          Build something
          <span class="text-blue-600">amazing</span>
        </h1>
        <p class="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          The modern platform for building and scaling your next big idea.
          Start free, scale infinitely.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/signup"
            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Start for Free
          </a>
          <a
            href="#features"
            class="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Learn More
          </a>
        </div>
        <p class="mt-4 text-sm text-gray-500">No credit card required</p>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900">Everything you need</h2>
          <p class="mt-4 text-xl text-gray-600">
            Powerful features to help you build faster
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div class="text-4xl mb-4">{{ feature.icon }}</div>
            <h3 class="text-xl font-semibold text-gray-900">{{ feature.title }}</h3>
            <p class="mt-2 text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p class="mt-4 text-xl text-gray-600">
            Choose the plan that works for you
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div
            v-for="plan in plans"
            :key="plan.name"
            :class="[
              'rounded-2xl p-8 border-2 transition-all',
              plan.highlighted
                ? 'border-blue-600 shadow-xl scale-105'
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <div v-if="plan.highlighted" class="text-blue-600 text-sm font-semibold mb-2">
              Most Popular
            </div>
            <h3 class="text-xl font-semibold text-gray-900">{{ plan.name }}</h3>
            <p class="text-gray-500 mt-1">{{ plan.description }}</p>
            <div class="mt-4">
              <span class="text-4xl font-bold text-gray-900">{{ plan.price }}</span>
              <span class="text-gray-500">{{ plan.period }}</span>
            </div>
            <ul class="mt-6 space-y-3">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-center gap-2 text-gray-600"
              >
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ feature }}
              </li>
            </ul>
            <button
              :class="[
                'mt-8 w-full py-3 rounded-lg font-semibold transition-colors',
                plan.highlighted
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              ]"
            >
              {{ plan.cta }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 bg-blue-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white">Ready to get started?</h2>
        <p class="mt-4 text-xl text-blue-100">
          Join thousands of teams already building with us.
        </p>
        <a
          href="/signup"
          class="mt-8 inline-block bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
        >
          Start Your Free Trial
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 class="text-white font-semibold mb-4">Product</h4>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-white">Features</a></li>
              <li><a href="#" class="hover:text-white">Pricing</a></li>
              <li><a href="#" class="hover:text-white">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4">Company</h4>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-white">About</a></li>
              <li><a href="#" class="hover:text-white">Blog</a></li>
              <li><a href="#" class="hover:text-white">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4">Resources</h4>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-white">Documentation</a></li>
              <li><a href="#" class="hover:text-white">API Reference</a></li>
              <li><a href="#" class="hover:text-white">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4">Legal</h4>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-white">Privacy</a></li>
              <li><a href="#" class="hover:text-white">Terms</a></li>
            </ul>
          </div>
        </div>
        <div class="mt-12 pt-8 border-t border-gray-800 text-center">
          <p>&copy; 2024 YourBrand. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
