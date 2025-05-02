// Instagram Market Analysis Dashboard

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Set up event listeners
  setupEventListeners();
});

// Handle file upload
window.handleFileUpload = function() {
  const fileInput = document.getElementById('json-file-input');
  const analyzeButton = document.getElementById('analyze-button');
  const uploadInfo = document.getElementById('upload-info');
  
  // Enable/disable analyze button based on file selection
  fileInput.addEventListener('change', function(e) {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        analyzeButton.disabled = false;
        uploadInfo.className = 'alert alert-success mt-3';
        uploadInfo.textContent = `Selected file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      } else {
        analyzeButton.disabled = true;
        uploadInfo.className = 'alert alert-danger mt-3';
        uploadInfo.textContent = 'Please select a valid JSON file.';
      }
    } else {
      analyzeButton.disabled = true;
      uploadInfo.className = 'alert alert-info mt-3';
      uploadInfo.textContent = 'Select a JSON file to begin analysis.';
    }
  });
  
  // Handle analyze button click
  analyzeButton.addEventListener('click', function() {
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    // Show loading state
    uploadInfo.className = 'alert alert-info mt-3';
    uploadInfo.textContent = 'Reading file and processing data...';
    analyzeButton.disabled = true;
    
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        window.instagramData = data;
        
        // Show dashboard and initialize with data
        document.getElementById('dashboard-content').classList.remove('d-none');
        
        // First update metrics which should work regardless of chart issues
        updateOverviewMetrics(data);
        
        // Try initializing the rest with error handling
        try {
          // Try creating each chart individually to isolate errors
          try { createCommentsByTypeChart(data); } catch(e) { console.error('Error creating comments chart:', e); }
          try { createEngagementTimelineChart(data); } catch(e) { console.error('Error creating timeline chart:', e); }
          try { createHashtagChart(data); } catch(e) { console.error('Error creating hashtag chart:', e); }
          try { createCorrelationChart(data); } catch(e) { console.error('Error creating correlation chart:', e); }
          
          // Try initializing the table
          try { updatePostsTable(data, window.currentPage, window.currentFilter); } catch(e) { console.error('Error updating posts table:', e); }
          
          // Try generating meme prompts
          try { generateMemePrompts(data); } catch(e) { console.error('Error generating meme prompts:', e); }
        } catch (innerError) {
          console.error('Error initializing components:', innerError);
        }
        
        // Update upload section
        uploadInfo.className = 'alert alert-success mt-3';
        uploadInfo.textContent = `Analysis complete! Processed ${data.length} Instagram posts.`;
        analyzeButton.disabled = false;
        
        // Scroll to dashboard
        window.scrollTo({
          top: document.getElementById('dashboard-content').offsetTop - 20,
          behavior: 'smooth'
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        uploadInfo.className = 'alert alert-danger mt-3';
        uploadInfo.textContent = `Error parsing JSON file: ${error.message}. Please check if the file is valid.`;
        analyzeButton.disabled = false;
      }
    };
    
    reader.onerror = function() {
      uploadInfo.className = 'alert alert-danger mt-3';
      uploadInfo.textContent = 'Error reading file. Please try again.';
      analyzeButton.disabled = false;
    };
    
    reader.readAsText(file);
  });
}

// Initialize dashboard with data
window.initializeDashboard = function(data) {
  // Calculate and display key metrics
  updateOverviewMetrics(data);
  
  try {
    // Create charts
    createCommentsByTypeChart(data);
    createEngagementTimelineChart(data);
    createHashtagChart(data);
    createCorrelationChart(data);
    
    // Initialize post table
    updatePostsTable(data, currentPage, currentFilter);
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    // Continue showing what we can
  }
}

// Set up event listeners for interactive elements
window.setupEventListeners = function() {
  // File upload handling
  handleFileUpload();
  
  // Export to PDF button
  document.getElementById('export-pdf').addEventListener('click', exportToPDF);
  
  // Post filter and pagination
  document.getElementById('apply-filter').addEventListener('click', function() {
    currentFilter = document.getElementById('post-filter').value;
    currentPage = 1;
    updatePostsTable(instagramData, currentPage, currentFilter);
  });
  
  document.getElementById('prev-page').addEventListener('click', function() {
    if (currentPage > 1) {
      currentPage--;
      updatePostsTable(instagramData, currentPage, currentFilter);
    }
  });
  
  document.getElementById('next-page').addEventListener('click', function() {
    const totalPages = Math.ceil(filterPosts(instagramData, currentFilter).length / postsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      updatePostsTable(instagramData, currentPage, currentFilter);
    }
  });
  
  // Copy prompt to clipboard
  document.getElementById('copy-prompt').addEventListener('click', function() {
    const content = document.getElementById('meme-modal-content').textContent;
    navigator.clipboard.writeText(content)
      .then(() => alert('Prompt copied to clipboard!'))
      .catch(err => console.error('Failed to copy: ', err));
  });
  
  // Setup meme prompt card click handlers
  document.addEventListener('click', function(e) {
    if (e.target.closest('.meme-prompt-card')) {
      const card = e.target.closest('.meme-prompt-card');
      showMemePromptModal(card.dataset.id);
    }
  });
}

// Update overview metrics
window.updateOverviewMetrics = function(data) {
  // Calculate metrics
  const totalPosts = data.length;
  
  // Count total comments
  const totalComments = data.reduce((sum, post) => {
    return sum + (post.commentsCount || 0);
  }, 0);
  
  // Calculate average comments per post
  const avgComments = totalComments / totalPosts;
  
  // Count total likes
  const totalLikes = data.reduce((sum, post) => {
    return sum + (post.likesCount || 0);
  }, 0);
  
  // Update DOM elements
  document.getElementById('total-posts').textContent = totalPosts.toLocaleString();
  document.getElementById('total-comments').textContent = totalComments.toLocaleString();
  document.getElementById('avg-comments').textContent = avgComments.toFixed(1);
  document.getElementById('total-likes').textContent = totalLikes.toLocaleString();
}

// Create chart showing comments by post type
window.createCommentsByTypeChart = function(data) {
  // Group posts by type and count comments
  const postTypes = {};
  data.forEach(post => {
    const type = post.type || 'Unknown';
    if (!postTypes[type]) {
      postTypes[type] = {
        count: 0,
        comments: 0
      };
    }
    postTypes[type].count++;
    postTypes[type].comments += (post.commentsCount || 0);
  });
  
  // Prepare chart data
  const labels = Object.keys(postTypes);
  const commentData = labels.map(label => postTypes[label].comments);
  const avgCommentsData = labels.map(label => postTypes[label].comments / postTypes[label].count);
  
  // Get chart canvas element
  const canvas = document.getElementById('comment-by-type-chart');
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart instance if it exists to prevent memory leaks
  if (window.commentsByTypeChart) {
    window.commentsByTypeChart.destroy();
  }
  
  // Create new chart with fixed size constraints
  window.commentsByTypeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Comments',
          data: commentData,
          backgroundColor: 'rgba(13, 110, 253, 0.7)',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 1
        },
        {
          label: 'Avg Comments per Post',
          data: avgCommentsData,
          backgroundColor: 'rgba(220, 53, 69, 0.7)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Comment Volume by Post Type'
        },
        tooltip: {
          callbacks: {
            footer: function(tooltipItems) {
              const index = tooltipItems[0].dataIndex;
              const label = labels[index];
              return `Posts: ${postTypes[label].count}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Total Comments'
          }
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          title: {
            display: true,
            text: 'Avg Comments Per Post'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

// Create timeline of engagement (comments and likes over time)
window.createEngagementTimelineChart = function(data) {
  // Sort data by timestamp
  const timeData = data
    .filter(post => post.timestamp) // Only include posts with timestamps
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // Group by month for better visualization
  const months = {};
  timeData.forEach(post => {
    const date = new Date(post.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!months[monthKey]) {
      months[monthKey] = {
        count: 0,
        comments: 0,
        likes: 0
      };
    }
    
    months[monthKey].count++;
    months[monthKey].comments += (post.commentsCount || 0);
    months[monthKey].likes += (post.likesCount || 0);
  });
  
  // Prepare chart data - limit to last 12 months maximum to prevent excessive width
  const labels = Object.keys(months).sort();
  const limitedLabels = labels.slice(Math.max(0, labels.length - 12)); // Only show up to 12 months
  
  const commentsData = limitedLabels.map(key => months[key].comments);
  const likesData = limitedLabels.map(key => months[key].likes);
  
  // Format labels to be more readable
  const formattedLabels = limitedLabels.map(monthKey => {
    const [year, month] = monthKey.split('-');
    return new Date(year, month - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  });
  
  // Get chart canvas element
  const canvas = document.getElementById('engagement-timeline-chart');
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart instance if it exists to prevent memory leaks
  if (window.engagementTimelineChart) {
    window.engagementTimelineChart.destroy();
  }
  
  // Create new chart with fixed size constraints
  window.engagementTimelineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: formattedLabels,
      datasets: [
        {
          label: 'Comments',
          data: commentsData,
          backgroundColor: 'rgba(13, 110, 253, 0.2)',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        },
        {
          label: 'Likes',
          data: likesData,
          backgroundColor: 'rgba(220, 53, 69, 0.2)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Engagement Timeline'
        },
        tooltip: {
          callbacks: {
            footer: function(tooltipItems) {
              const index = tooltipItems[0].dataIndex;
              const label = labels[index];
              return `Posts: ${months[label].count}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Count'
          }
        }
      }
    }
  });
}

// Create hashtag analysis chart
window.createHashtagChart = function(data) {
  // Extract all hashtags
  const hashtags = {};
  data.forEach(post => {
    if (Array.isArray(post.hashtags)) {
      post.hashtags.forEach(tag => {
        if (!hashtags[tag]) {
          hashtags[tag] = {
            count: 0,
            comments: 0
          };
        }
        hashtags[tag].count++;
        hashtags[tag].comments += (post.commentsCount || 0);
      });
    }
  });
  
  // Sort hashtags by frequency and get top 10
  const topHashtags = Object.keys(hashtags)
    .filter(tag => tag) // Remove empty tags
    .sort((a, b) => hashtags[b].count - hashtags[a].count)
    .slice(0, 10);
  
  // Prepare chart data
  const counts = topHashtags.map(tag => hashtags[tag].count);
  const commentsPerPost = topHashtags.map(tag => hashtags[tag].comments / hashtags[tag].count);
  
  // Get chart canvas element
  const canvas = document.getElementById('hashtag-chart');
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart instance if it exists to prevent memory leaks
  if (window.hashtagChart) {
    window.hashtagChart.destroy();
  }
  
  // Create new chart with fixed size constraints
  window.hashtagChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topHashtags,
      datasets: [
        {
          label: 'Frequency',
          data: counts,
          backgroundColor: 'rgba(13, 110, 253, 0.7)',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 1
        },
        {
          label: 'Avg Comments',
          data: commentsPerPost,
          backgroundColor: 'rgba(25, 135, 84, 0.7)',
          borderColor: 'rgba(25, 135, 84, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      indexAxis: 'y',
      plugins: {
        title: {
          display: true,
          text: 'Top Hashtags Analysis'
        }
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Hashtag'
          }
        },
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Post Count'
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Avg Comments'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

// Create correlation chart between comments and likes
window.createCorrelationChart = function(data) {
  // Filter valid data points
  const validData = data.filter(post => 
    post.commentsCount !== undefined && 
    post.commentsCount !== null && 
    post.likesCount !== undefined && 
    post.likesCount !== null
  );
  
  // Limit to 200 data points maximum to prevent performance issues
  const limitedData = validData.length > 200 ? validData.slice(0, 200) : validData;
  
  // Prepare scatter plot data
  const scatterData = limitedData.map(post => ({
    x: post.commentsCount,
    y: post.likesCount,
    r: 5, // Point radius
    postId: post.id,
    caption: post.caption || 'No caption',
    type: post.type || 'Unknown'
  }));
  
  // Get chart canvas element
  const canvas = document.getElementById('correlation-chart');
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart instance if it exists to prevent memory leaks
  if (window.correlationChart) {
    window.correlationChart.destroy();
  }
  
  // Create new chart with fixed size constraints
  window.correlationChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Comments vs Likes',
        data: scatterData,
        backgroundColor: 'rgba(13, 110, 253, 0.7)',
        borderColor: 'rgba(13, 110, 253, 1)',
        borderWidth: 1,
        pointHoverRadius: 8
      }]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Comments vs Likes Correlation'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const point = context.raw;
              return [
                `Type: ${point.type}`,
                `Comments: ${point.x}`,
                `Likes: ${point.y}`,
                `Caption: ${point.caption.substring(0, 30)}${point.caption.length > 30 ? '...' : ''}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Comments'
          },
          beginAtZero: true
        },
        y: {
          title: {
            display: true,
            text: 'Likes'
          },
          beginAtZero: true
        }
      }
    }
  });
}
