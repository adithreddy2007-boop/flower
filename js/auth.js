// ============================================================
// AUTH GATE — index.html (the builder) requires a signed-in
// user. If nobody's signed in, bounce to login.html. Any
// account created via login.html/signup.html (email/password
// or Google) is allowed through.
// ============================================================
function initAuthGate(onReady){
  auth.onAuthStateChanged(user=>{
    if(user){
      onReady(user);
    } else {
      location.href = "login.html";
    }
  });
}
