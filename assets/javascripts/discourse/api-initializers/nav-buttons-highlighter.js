import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.11.1", (api) => {
  console.log("[Nav Buttons Highlighter] Component loaded!");
  
  // Simple test - just log that we're here
  api.onPageChange(() => {
    console.log("[Nav Buttons Highlighter] Page changed");
    
    // Force navigation visible
    const navBar = document.querySelector('#navigation-bar');
    if (navBar) {
      console.log("[Nav Buttons Highlighter] Found navigation bar");
      const items = navBar.querySelectorAll('li');
      items.forEach(item => {
        item.style.display = 'inline-flex';
        item.style.visibility = 'visible';
        item.style.opacity = '1';
      });
    } else {
      console.log("[Nav Buttons Highlighter] Navigation bar not found");
    }
  });
});