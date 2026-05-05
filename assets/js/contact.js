const GITHUB_TOKEN = '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'; // Replace with your actual token
const GITHUB_OWNER = 'marouanbouchettoy';
const GITHUB_REPO = 'Parapharmacie';
const FILE_PATH = 'assets/data/contact.json';

async function sendForm() {
  const firstname = document.getElementById('firstname').value.trim();
  const lastname = document.getElementById('lastname').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value.trim();
  if (!firstname || !email || !subject || !message) {
    showToast('⚠️ Veuillez remplir tous les champs obligatoires.');
    return;
  }

  const newEntry = {
    id: Date.now(),
    firstname,
    lastname,
    email,
    phone,
    subject,
    message,
    timestamp: new Date().toISOString()
  };

  try {
    // Get current file content and SHA
    const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!getResponse.ok) throw new Error('Failed to fetch current file');

    const fileData = await getResponse.json();
    const currentContent = JSON.parse(atob(fileData.content));
    currentContent.push(newEntry);
    const newContent = JSON.stringify(currentContent, null, 2);

    // Update file
    const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Add new contact form submission',
        content: btoa(newContent),
        sha: fileData.sha
      })
    });
    if (!updateResponse.ok) throw new Error('Failed to update file');

    // Update local file (optional, for immediate local update)
    // Since client-side can't write files, this is just for demo
    console.log('Data saved to GitHub');

    document.getElementById('contact-form').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;">
        <div style="font-size:4rem;margin-bottom:1rem;">✅</div>
        <h3 style="color:var(--plum);margin-bottom:0.5rem;font-family:'Cormorant Garamond',serif;font-size:1.8rem;">Message envoyé !</h3>
        <p style="color:var(--text-mid);margin-bottom:1.5rem;">Merci ${firstname}, nous vous répondrons sous 24h à l'adresse <strong>${email}</strong>.</p>
        <a href="index.html" class="btn btn-primary">Retour à l'accueil</a>
      </div>`;
    showToast('✅ Votre message a été envoyé !', 'success');
  } catch (error) {
    console.error('Error saving to GitHub:', error);
    showToast('❌ Erreur lors de l\'envoi. Veuillez réessayer.');
  }
}