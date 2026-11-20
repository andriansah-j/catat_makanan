import React, { useState, useEffect } from 'react';
import ReceiptUploader from './components/ReceiptUploader';
import ReceiptForm from './components/ReceiptForm';
import ReceiptList from './components/ReceiptList';
import Reports from './components/Reports';
import Auth from './components/Auth';
import UserManagement from './components/UserManagement';
import { UtensilsCrossed, ScanLine, List as ListIcon, BarChart, LogOut, User, Users as UsersIcon } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('current-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [allUsers, setAllUsers] = useState([]);
  const [allReceipts, setAllReceipts] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [currentScan, setCurrentScan] = useState(null);
  const [activeTab, setActiveTab] = useState('scan');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('current-user', JSON.stringify(currentUser));
      fetchData();
    } else {
      localStorage.removeItem('current-user');
      setAllUsers([]);
      setAllReceipts([]);
    }
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    setIsLoadingData(true);
    try {
      const [receiptsRes, usersRes] = await Promise.all([
        fetch('/api/receipts'),
        currentUser.id === 6477 ? fetch('/api/users') : Promise.resolve({ ok: true, json: () => [] })
      ]);
      
      if (receiptsRes.ok) setAllReceipts(await receiptsRes.json());
      if (usersRes.ok) setAllUsers(await usersRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchUsers = async () => {
    if (currentUser && currentUser.id === 6477) {
      try {
        const res = await fetch('/api/users');
        if (res.ok) setAllUsers(await res.json());
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }
  };

  // If no user is logged in, show Auth screen
  if (!currentUser) {
    return <Auth onLogin={(user) => setCurrentUser(user)} />;
  }

  // Filter receipts for the logged-in user only, except ID 6477 sees all
  const userReceipts = currentUser.id === 6477 
    ? allReceipts 
    : allReceipts.filter(r => r.userId === currentUser.id);

  const handleOcrComplete = (data) => {
    setCurrentScan(data);
  };

  const handleSaveReceipt = async (data) => {
    const receiptWithUser = {
      ...data,
      userId: currentUser.id
    };
    
    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptWithUser)
      });
      if (!res.ok) throw new Error("Failed to save receipt");
      const savedReceipt = await res.json();
      setAllReceipts(prev => [savedReceipt, ...prev]);
      setCurrentScan(null);
      setActiveTab('list');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelEdit = () => {
    setCurrentScan(null);
  };

  const handleDeleteReceipt = async (id) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) return;
    
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete receipt");
      setAllReceipts(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScan(null);
    setActiveTab('scan');
  };

  return (
    <>
      <header className="flex flex-col items-center justify-center mb-8 mt-6 relative animate-fade-in">
        {/* User Badge & Logout */}
        <div className="absolute top-0 right-0 flex items-center gap-4 bg-card-bg border border-card-border px-4 py-2 rounded-full shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-medium">
            <User size={16} className="text-primary" />
            <span>{currentUser.username} <span className="text-muted text-xs font-normal">#{currentUser.id}</span></span>
          </div>
          <div className="w-px h-4 bg-white/20"></div>
          <button 
            onClick={handleLogout}
            className="text-muted hover:text-danger flex items-center gap-1 text-sm transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className="bg-primary/20 p-4 rounded-full mb-4 ring-4 ring-primary/30 shadow-lg shadow-primary/20 mt-8 md:mt-0">
          <UtensilsCrossed size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gradient mb-2 tracking-tight">
          Food Receipt Tracker
        </h1>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex justify-center mb-8 sticky top-4 z-50">
        <div className="glass-panel !p-1 flex gap-1 rounded-full w-full max-w-2xl overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'scan' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-white hover:bg-white/5'}`}
          >
            <ScanLine size={16} /> Scan
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'list' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-white hover:bg-white/5'}`}
          >
            <ListIcon size={16} /> {currentUser.id === 6477 ? 'All Users Logs' : 'All Logs'}
            {userReceipts.length > 0 && activeTab !== 'list' && (
               <span className="bg-primary/30 text-white text-xs px-2 py-0.5 rounded-full ml-1">{userReceipts.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'reports' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-white hover:bg-white/5'}`}
          >
            <BarChart size={16} /> Reports
          </button>
          
          {/* Admin Tab */}
          {currentUser.id === 6477 && (
             <button 
               onClick={() => setActiveTab('users')}
               className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-white hover:bg-white/5'}`}
             >
               <UsersIcon size={16} /> Manage Users
             </button>
          )}
        </div>
      </nav>

      <main className="flex-1 w-full relative z-10">
        {isLoadingData ? (
           <div className="flex flex-col items-center justify-center py-12 text-muted">
             <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
             Loading data...
           </div>
        ) : (
          <>
            {activeTab === 'scan' && (
              <div className="animate-fade-in">
                 {!currentScan ? (
                    <ReceiptUploader onOcrComplete={handleOcrComplete} />
                 ) : (
                    <ReceiptForm 
                      initialData={currentScan} 
                      onSave={handleSaveReceipt} 
                      onCancel={handleCancelEdit} 
                    />
                 )}
              </div>
            )}

            {activeTab === 'list' && (
              <div className="animate-fade-in">
                <div className="mb-6 flex justify-between items-center bg-card-bg border border-card-border p-4 rounded-xl">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {currentUser.id === 6477 ? 'Global History' : 'All History'}
                  </h2>
                  <span className="bg-primary/20 text-primary text-sm py-1 px-3 rounded-full font-medium">
                    {userReceipts.length} Total
                  </span>
                </div>
                <ReceiptList receipts={userReceipts} onDelete={handleDeleteReceipt} />
              </div>
            )}

            {activeTab === 'reports' && (
              <Reports 
                receipts={userReceipts} 
                onDeleteReceipt={handleDeleteReceipt}
                currentUser={currentUser}
                allUsers={allUsers}
              />
            )}

            {activeTab === 'users' && currentUser.id === 6477 && (
              <UserManagement 
                 users={allUsers}
                 fetchUsers={fetchUsers}
              />
            )}
          </>
        )}
      </main>

      <footer className="mt-12 py-6 text-center text-muted text-sm border-t border-white/5">
        <p>Food Receipt Tracker &copy; {new Date().getFullYear()}</p>
      </footer>
    </>
  );
}

export default App;
