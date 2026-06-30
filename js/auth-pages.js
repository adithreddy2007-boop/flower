// ============================================================
// AUTH PAGES — email/password + Google sign in & sign up.
// On success, redirects back to index.html (the gift builder).
// ============================================================
function $(sel){ return document.querySelector(sel); }

function showFormError(msg){
  $("#formError").textContent = friendlyAuthError(msg);
}

function friendlyAuthError(err){
  const code = (err && err.code) || "";
  const map = {
    "auth/email-already-in-use": "That email already has an account — try logging in instead.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Password needs to be at least 6 characters.",
    "auth/user-not-found": "No account found with that email — sign up first.",
    "auth/wrong-password": "That password doesn't match.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/too-many-requests": "Too many attempts — wait a moment and try again.",
    "auth/unauthorized-domain": "This domain isn't authorized in Firebase yet (Authentication → Settings → Authorized domains).",
    "auth/configuration-not-found": "Email/Password sign-in isn't enabled yet in Firebase (Authentication → Sign-in method).",
  };
  return map[code] || (err && err.message) || "Something went wrong — please try again.";
}

function redirectToApp(){
  location.href = "index.html";
}

// Already signed in? Skip straight through.
auth.onAuthStateChanged(user=>{
  if(user) redirectToApp();
});

async function googleSignIn(){
  $("#formError").textContent = "";
  const provider = new firebase.auth.GoogleAuthProvider();
  try{
    await auth.signInWithPopup(provider);
    redirectToApp();
  }catch(err){
    showFormError(err);
  }
}

async function handleSignup(e){
  e.preventDefault();
  $("#formError").textContent = "";
  const name = $("#nameInput").value.trim();
  const email = $("#emailInput").value.trim();
  const phoneCode = $("#phoneCode") ? $("#phoneCode").value : "";
  const phone = $("#phoneInput") ? $("#phoneInput").value.trim() : "";
  const pw = $("#passwordInput").value;
  const pw2 = $("#confirmInput").value;

  if(!name){ showFormError({message:"Please enter your name."}); return; }
  if(pw.length < 6){ showFormError({code:"auth/weak-password"}); return; }
  if(pw !== pw2){ showFormError({message:"Passwords don't match."}); return; }

  const btn = $("#submitBtn");
  btn.disabled = true; btn.textContent = "Creating…";
  try{
    const cred = await auth.createUserWithEmailAndPassword(email, pw);
    await cred.user.updateProfile({ displayName: name });
    await db.collection("users").doc(cred.user.uid).set({
      name, email, phone: phone ? `${phoneCode}${phone}` : null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    redirectToApp();
  }catch(err){
    showFormError(err);
    btn.disabled = false; btn.textContent = "Create Account 🌷";
  }
}

async function handleLogin(e){
  e.preventDefault();
  $("#formError").textContent = "";
  const email = $("#emailInput").value.trim();
  const pw = $("#passwordInput").value;
  const btn = $("#submitBtn");
  btn.disabled = true; btn.textContent = "Logging in…";
  try{
    await auth.signInWithEmailAndPassword(email, pw);
    redirectToApp();
  }catch(err){
    showFormError(err);
    btn.disabled = false; btn.textContent = "Log In 🌷";
  }
}
