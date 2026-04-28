const { useState, useEffect } = React;

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner border-t-[var(--green)] border-[var(--green-pale)] w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div>
      {session ? (
        <Dashboard session={session} onLogout={() => supabaseClient.auth.signOut()} />
      ) : (
        <Auth onLogin={setSession} />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
