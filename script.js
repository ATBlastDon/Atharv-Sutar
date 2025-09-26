// Initialize AOS
AOS.init({ 
  duration: 800, 
  once: true,
  offset: 100
});

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
if (mobileMenuButton) {
  mobileMenuButton.addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
  });
}

// Close mobile menu when clicking links
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.add('hidden');
  });
});

// Back to top button
const backToTopButton = document.getElementById('back-to-top');

if (backToTopButton) {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.remove('opacity-0', 'invisible');
      backToTopButton.classList.add('opacity-100', 'visible');
    } else {
      backToTopButton.classList.remove('opacity-100', 'visible');
      backToTopButton.classList.add('opacity-0', 'invisible');
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Animate skill bars on scroll
function animateSkillBars() {
  const skillBars = document.querySelectorAll('.skill-bar');
  skillBars.forEach(bar => {
    const width = bar.getAttribute('data-width');
    if (width) bar.style.width = width;
  });
}

// Use Intersection Observer to trigger skill bar animation
const skillsSection = document.getElementById('skills');
if (skillsSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateSkillBars();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(skillsSection);
}

// Update navigation dots on scroll
window.addEventListener('scroll', function() {
  const sections = document.querySelectorAll('section');
  const navDots = document.querySelectorAll('.nav-dot');
  
  let currentSection = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 200) {
      currentSection = section.getAttribute('id');
    }
  });
  
  navDots.forEach(dot => {
    dot.classList.remove('active');
    const href = dot.getAttribute('href') || '';
    if (href.substring(1) === currentSection) {
      dot.classList.add('active');
    }
  });
});

// Bot Animation Functionality
const botButton = document.getElementById('botButton');
const botChat = document.getElementById('botChat');
const closeChat = document.getElementById('closeChat');
const sendMessage = document.getElementById('sendMessage');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

if (botButton && botChat) {
  // Toggle chat visibility
  botButton.addEventListener('click', function() {
    botChat.classList.toggle('open');
  });
}

if (closeChat && botChat) {
  // Close chat when close button is clicked
  closeChat.addEventListener('click', function() {
    botChat.classList.remove('open');
  });
}

// Send message functionality
function sendUserMessage() {
  if (!chatInput || !chatMessages) return;
  const message = chatInput.value.trim();
  if (message === '') return;

  // Add user message to chat
  const userMessage = document.createElement('div');
  userMessage.classList.add('message', 'user-message');
  userMessage.textContent = message;
  chatMessages.appendChild(userMessage);

  // Clear input
  chatInput.value = '';

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.classList.add('typing-indicator');
  typingIndicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Simulate bot response after a delay
  setTimeout(() => {
    // Remove typing indicator
    typingIndicator.remove();

    // Add bot response
    const botResponse = document.createElement('div');
    botResponse.classList.add('message', 'bot-message');
    
    // Simple response logic based on keywords
    let response = "Thanks for your message! I'm a simple bot helping visitors learn about Atharv. For detailed information, please check out the sections above or contact him directly.";
    
    const lower = message.toLowerCase();
    if (lower.includes('project')) {
      response = "Atharv has worked on several interesting projects including StudySync (a Flutter app for teachers) and a Library Management System. Check out the Projects section for details!";
    } else if (lower.includes('skill') || lower.includes('python') || lower.includes('flutter')) {
      response = "Atharv specializes in Python and Flutter development with experience in AI/ML. He also knows SQL, Git, and Firebase. See the Skills section for more details!";
    } else if (lower.includes('contact') || lower.includes('email') || lower.includes('phone')) {
      response = "You can contact Atharv via email at atharvsutar3102003@gmail.com or phone at +91-7776884373. Check the Contact section for more ways to reach him!";
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      response = "Hello! I'm Atharv's assistant. How can I help you learn more about him today?";
    }
    
    botResponse.textContent = response;
    chatMessages.appendChild(botResponse);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 1500);
}

if (sendMessage) {
  sendMessage.addEventListener('click', sendUserMessage);
}

if (chatInput) {
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendUserMessage();
    }
  });
}

// Close chat when clicking outside of it
document.addEventListener('click', function(e) {
  if (!botChat || !botButton) return;
  if (!botChat.contains(e.target) && !botButton.contains(e.target) && botChat.classList.contains('open')) {
    botChat.classList.remove('open');
  }
});
