// Instagram Market Analysis - Utility Functions

// Filter posts based on selected filter
window.filterPosts = function(data, filter) {
  switch(filter) {
    case 'comments':
      return [...data].sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    case 'likes':
      return [...data].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    case 'recent':
      return [...data].sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    case 'all':
    default:
      return data;
  }
}

// Update the posts table with filtered data
window.updatePostsTable = function(data, page, filter) {
  const filteredData = filterPosts(data, filter);
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;
  const pageData = filteredData.slice(start, end);
  
  const tableBody = document.getElementById('posts-table-body');
  tableBody.innerHTML = '';
  
  pageData.forEach(post => {
    const row = document.createElement('tr');
    
    // Format date
    let dateStr = 'N/A';
    if (post.timestamp) {
      const date = new Date(post.timestamp);
      dateStr = date.toLocaleDateString();
    }
    
    // Create row content
    row.innerHTML = `
      <td>${post.type || 'Unknown'}</td>
      <td>${post.caption ? post.caption.substring(0, 50) + (post.caption.length > 50 ? '...' : '') : 'No caption'}</td>
      <td>${post.commentsCount || 0}</td>
      <td>${post.likesCount || 0}</td>
      <td>${dateStr}</td>
      <td><button class="btn btn-sm btn-outline-primary view-post-btn" data-post-id="${post.id}">View</button></td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners to view buttons
  document.querySelectorAll('.view-post-btn').forEach(button => {
    button.addEventListener('click', function() {
      const postId = this.dataset.postId;
      showPostDetail(postId);
    });
  });
  
  // Update pagination info
  document.getElementById('page-info').textContent = `Page ${page}`;
  document.getElementById('prev-page').disabled = page === 1;
  document.getElementById('next-page').disabled = end >= filteredData.length;
  
  // Update table info
  document.getElementById('table-info').textContent = `Showing ${start + 1} to ${Math.min(end, filteredData.length)} of ${filteredData.length} posts`;
}

// Show post detail
window.showPostDetail = function(postId) {
  // Access the global variable from window context to ensure it's available
  const instagramData = window.instagramData || [];
  const post = instagramData.find(p => p.id === postId);
  if (!post) return;
  
  // Update detail view
  document.getElementById('detail-caption').textContent = post.caption || 'No caption';
  document.getElementById('detail-type').textContent = post.type || 'Unknown';
  document.getElementById('detail-comments').textContent = post.commentsCount || 0;
  document.getElementById('detail-likes').textContent = post.likesCount || 0;
  
  const date = post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'N/A';
  document.getElementById('detail-date').textContent = date;
  
  const hashtags = Array.isArray(post.hashtags) && post.hashtags.length > 0 ? 
    post.hashtags.join(', ') : 'None';
  document.getElementById('detail-hashtags').textContent = hashtags;
  
  const url = document.getElementById('detail-url');
  if (post.url) {
    url.href = post.url;
    url.textContent = post.url;
  } else {
    url.href = '#';
    url.textContent = 'Not available';
  }
  
  // Show comments if available
  const commentsList = document.getElementById('comments-list');
  commentsList.innerHTML = '';
  
  if (post.latestComments && post.latestComments.length > 0) {
    post.latestComments.forEach(comment => {
      const commentItem = document.createElement('div');
      commentItem.className = 'comment-item';
      
      // Format date
      let commentDate = 'N/A';
      if (comment.timestamp) {
        const date = new Date(comment.timestamp);
        commentDate = date.toLocaleDateString();
      }
      
      commentItem.innerHTML = `
        <div class="comment-user">${comment.ownerUsername || 'Anonymous'}</div>
        <div class="comment-text">${comment.text || 'No text'}</div>
        <div class="comment-meta">
          <span>Likes: ${comment.likesCount || 0}</span> | 
          <span>Date: ${commentDate}</span>
        </div>
      `;
      
      commentsList.appendChild(commentItem);
    });
  } else if (post.firstComment) {
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';
    commentItem.innerHTML = `
      <div class="comment-text">${post.firstComment}</div>
      <div class="comment-meta">First comment</div>
    `;
    commentsList.appendChild(commentItem);
  } else {
    commentsList.innerHTML = '<div class="text-center py-3">No comments available</div>';
  }
  
  // Show the detail view
  document.getElementById('no-post-selected').classList.add('d-none');
  document.getElementById('post-detail').classList.remove('d-none');
}

// Export to PDF function
window.exportToPDF = function() {
  // Prepare the content to export
  const dashboard = document.getElementById('dashboard-content');
  
  // Configure PDF options
  const options = {
    margin: 10,
    filename: 'Instagram_Market_Analysis_' + new Date().toISOString().split('T')[0] + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  // Create PDF
  html2pdf().set(options).from(dashboard).save();
}
