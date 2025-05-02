// Instagram Market Analysis - Meme Prompt Generator

// Common words to exclude from topic analysis
const commonWords = ['this', 'that', 'with', 'from', 'have', 'what', 'your', 'will', 'about', 'they', 'when'];

// Generate meme prompts based on data analysis
// Make function globally accessible by attaching to window object
window.generateMemePrompts = function(data) {
  // Analyze data for insights
  const insights = analyzeMemeInsights(data);
  
  // Create meme prompts
  const multiTilePrompts = [
    {
      id: 'multi1',
      title: 'The Entrepreneurial Journey',
      type: 'multi',
      prompt: `Create a 4-panel meme story about the entrepreneurial journey. Panel 1: A person excitedly starting a business with the caption "When you first discover ${insights.topTopic}". Panel 2: The reality of hard work with caption "Three months in: ${insights.challenge}". Panel 3: Contemplating giving up with caption "The moment of truth: ${insights.pain}". Panel 4: Victory and success with caption "When you finally ${insights.victory}". Use conversation bubbles to show inner thoughts throughout the journey.`
    },
    {
      id: 'multi2',
      title: 'Client Conversations',
      type: 'multi',
      prompt: `Create a 3-panel meme with conversation bubbles showing client interactions. Panel 1: Client saying "I need ${insights.topTopic} but don't want to pay market rates". Panel 2: Freelancer with thought bubble "Here we go again..." while saying "Let me explain the value". Panel 3: Resolution with client saying "OK I get it now, when can you start?". Make it relatable to freelancers in the ${insights.industry} space.`
    },
    {
      id: 'multi3',
      title: 'The Growth Process',
      type: 'multi',
      prompt: `Create a 3-panel storytelling meme about personal growth in business. Panel 1: Person struggling with caption "Me trying to understand ${insights.complexTopic}". Panel 2: The lightbulb moment with caption "The moment it clicks after watching 47 YouTube tutorials". Panel 3: Now teaching others with caption "Me explaining ${insights.topTopic} like I've known it my whole life". Use exaggerated expressions and contrast between panels.`
    },
    {
      id: 'multi4',
      title: 'Expectations vs. Reality',
      type: 'multi',
      prompt: `Create a 2-panel meme contrasting expectations vs reality. Panel 1: "What people think ${insights.profession} do all day" showing glamorous work. Panel 2: "What ${insights.profession} actually do" showing the real challenges like ${insights.challenge}. Make it visually striking with conversation bubbles containing insider jokes about the industry.`
    },
    {
      id: 'multi5',
      title: 'The Team Dynamic',
      type: 'multi',
      prompt: `Create a 4-panel meme showing team dynamics in ${insights.industry}. Panel 1: The visionary leader announcing "We need to ${insights.topTrend}!". Panel 2: The skeptical team member with thought bubble "Not this again...". Panel 3: The implementation chaos with caption "Two weeks later...". Panel 4: The surprising success with everyone celebrating. Use conversation bubbles to show the different team perspectives throughout the process.`
    }
  ];
  
  const singleTilePrompts = [
    {
      id: 'single1',
      title: 'The Monday Feeling',
      type: 'single',
      prompt: `Create a single-panel meme with the caption "That Monday feeling when you realize you have 37 ${insights.task} to complete before noon." Show an exasperated professional at their desk with a mountain of work and a tiny coffee cup.`
    },
    {
      id: 'single2',
      title: 'Client Feedback',
      type: 'single',
      prompt: `Create a single-panel meme showing a professional looking at their computer with the caption "When the client says 'I'm not sure what I want, but I'll know it when I see it'" with a subtle reference to ${insights.topTopic} in the background.`
    },
    {
      id: 'single3',
      title: 'Success Celebration',
      type: 'single',
      prompt: `Create a single-panel meme with the caption "That feeling when you finally ${insights.achievement} after months of trying." Show an over-the-top celebration scene that's comically disproportionate to the actual achievement.`
    },
    {
      id: 'single4',
      title: 'Industry Problems',
      type: 'single',
      prompt: `Create a single-panel meme addressing a common industry problem with the caption "${insights.industry} professionals trying to explain to clients why ${insights.misconception} isn't how it actually works." Show someone desperately trying to explain something with increasingly complex visual aids.`
    },
    {
      id: 'single5',
      title: 'Productivity Hack',
      type: 'single',
      prompt: `Create a single-panel meme with the caption "My productivity hack: Waiting until the absolute last minute when the panic sets in." Show someone frantically working surrounded by ${insights.tools} with a clock showing almost deadline time.`
    },
    {
      id: 'single6',
      title: 'Trend Followers',
      type: 'single',
      prompt: `Create a single-panel meme with the caption "Everyone jumping on the ${insights.topTrend} trend without understanding it." Show a crowd of people blindly following a trend while one person looks on skeptically.`
    },
    {
      id: 'single7',
      title: 'Expert vs. Novice',
      type: 'single',
      prompt: `Create a single-panel meme comparing experts vs novices in ${insights.topTopic} with the caption "What people with 1 week experience vs 10 years experience say about ${insights.complexTopic}." Show two contrasting boxes of text - one extremely complicated explanation and one simple truth.`
    }
  ];
  
  // Combine prompts
  memePrompts = [...multiTilePrompts, ...singleTilePrompts];
  
  // Populate the meme prompts container
  const container = document.getElementById('meme-prompts-container');
  container.innerHTML = '';
  
  memePrompts.forEach(prompt => {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    col.innerHTML = `
      <div class="meme-prompt-card" data-id="${prompt.id}">
        <span class="meme-type-badge ${prompt.type === 'multi' ? 'meme-type-multi' : 'meme-type-single'}">
          ${prompt.type === 'multi' ? 'Multi-panel' : 'Single-panel'}
        </span>
        <h4>${prompt.title}</h4>
        <p>${prompt.prompt.substring(0, 100)}...</p>
      </div>
    `;
    
    container.appendChild(col);
  });
}

// Show meme prompt in modal
window.showMemePromptModal = function(promptId) {
  const prompt = memePrompts.find(p => p.id === promptId);
  if (!prompt) return;
  
  const modalTitle = document.getElementById('memeModalLabel');
  const modalContent = document.getElementById('meme-modal-content');
  
  modalTitle.textContent = prompt.title;
  modalContent.innerHTML = `
    <div class="mb-3">
      <span class="meme-type-badge ${prompt.type === 'multi' ? 'meme-type-multi' : 'meme-type-single'}">
        ${prompt.type === 'multi' ? 'Multi-panel Storytelling' : 'Single-panel'}
      </span>
    </div>
    <p>${prompt.prompt}</p>
  `;
  
  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById('meme-modal'));
  modal.show();
}

// Analyze data for meme insights
window.analyzeMemeInsights = function(data) {
  // Extract insights from the data to use in meme prompts
  
  // Find top topics from captions
  const topics = {};
  data.forEach(post => {
    if (post.caption) {
      // Extract potential topics from caption words (4+ letter words)
      const words = post.caption.split(/\s+/);
      words.forEach(word => {
        if (word.length >= 4) {
          const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanWord && !commonWords.includes(cleanWord)) {
            topics[cleanWord] = (topics[cleanWord] || 0) + 1;
          }
        }
      });
    }
  });
  
  // Sort topics by frequency
  const topTopics = Object.keys(topics)
    .filter(topic => topic.length > 3) // Filter out short topics
    .sort((a, b) => topics[b] - topics[a])
    .slice(0, 5);
  
  // Extract other insights
  const postTypes = {};
  data.forEach(post => {
    const type = post.type || 'Unknown';
    postTypes[type] = (postTypes[type] || 0) + 1;
  });
  
  // Dominant post type
  const dominantType = Object.keys(postTypes).sort((a, b) => postTypes[b] - postTypes[a])[0];
  
  // Create insights object
  return {
    topTopic: topTopics[0] || 'digital marketing',
    complexTopic: topTopics[1] || 'content strategy',
    industry: 'digital marketing',
    profession: 'marketers',
    task: 'client deliverables',
    challenge: 'explaining ROI to clients',
    pain: 'feeling like you're not making progress',
    victory: 'land that perfect client',
    achievement: 'get 10,000 authentic followers',
    tools: 'analytics dashboards',
    topTrend: dominantType === 'Video' ? 'short-form video' : 'user-generated content',
    misconception: 'thinking more followers automatically means more sales'
  };
}
