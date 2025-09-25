import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./Dashboard";
import SharedPlaylist from "./SharedPlaylist";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <Link to="/" className="header-title-link">
            <h1>AI Mood Maestro</h1>
          </Link>
          <div className="user-button-container">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </header>
        <main>
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  <SignedIn>
                    <Dashboard />
                  </SignedIn>
                  <SignedOut>
                    <div className="login-prompt">
                      <h2>Welcome!</h2>
                      <p>Please sign in to create playlists and save your history.</p>
                      <SignInButton mode="modal" />
                    </div>
                  </SignedOut>
                </>
              } 
            />
            <Route path="/playlist/:id" element={<SharedPlaylist />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;