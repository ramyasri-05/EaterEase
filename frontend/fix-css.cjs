const fs = require('fs');
let content = fs.readFileSync('src/App.css', 'utf-8');

// The file was corrupted by PowerShell's UTF-16LE echo output. We need to strip the null bytes.
const sanitized = content.replace(/\x00/g, '');

// Find the last known good part (the closing brace of the media query).
// The media query starts at `@media (max-width: 768px)`
const mqStart = sanitized.indexOf('@media (max-width: 768px)');
const mqEnd = sanitized.indexOf('}', sanitized.indexOf('}', sanitized.indexOf('}', mqStart) + 1) + 1) + 1;

let cleanContent = sanitized.substring(0, mqEnd);

// Add the new CSS properly
const newCss = `
/* Role Selector */
.role-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.25rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
}

.role-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: var(--muted);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.role-btn:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.05);
}

.role-btn.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 12px rgba(88, 214, 200, 0.3);
}

.role-btn.active.admin {
  background: var(--primary);
  box-shadow: 0 4px 12px rgba(255, 122, 89, 0.3);
}

.icon-wrapper.admin-wrapper {
  background: rgba(255, 122, 89, 0.1);
  color: var(--primary);
}

.btn-admin {
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  box-shadow: 0 12px 28px rgba(255, 90, 103, 0.3);
}
`;

fs.writeFileSync('src/App.css', cleanContent + '\n' + newCss);
console.log('Fixed CSS');
