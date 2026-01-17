const Navbar = ({ user, onLogout }) => (
  <nav className="flex justify-between items-center px-8 py-5 bg-white border-b border-gray-100 sticky top-0 z-50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic">H</div>
      <h1 className="text-xl font-black text-gray-800 tracking-tighter">SmartHealth <span className="text-blue-600">AI</span></h1>
    </div>
    <div className="flex items-center gap-6">
      <div className="text-right">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Logged in as</p>
        <p className="text-sm font-black text-gray-800">@{user}</p>
      </div>
      <button 
        onClick={onLogout}
        className="px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl text-[10px] font-black uppercase transition-all"
      >
        Logout
      </button>
    </div>
  </nav>
);

export default Navbar;