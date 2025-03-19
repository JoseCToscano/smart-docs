export const UserMenu = () => {
  return (
        <div className="bg-white rounded shadow-lg p-2 min-w-40 border border-gray-200">
          <div className="py-2 px-3 text-sm font-medium border-b border-gray-200 mb-2">
            John Doe
            <div className="text-xs text-gray-500 font-normal">john.doe@example.com</div>
          </div>
          <ul className="space-y-1">
            <li>
              <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded">
                Profile Settings
              </button>
            </li>
            <li>
              <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded">
                My Documents
              </button>
            </li>
            <li className="border-t border-gray-200 mt-1 pt-1">
              <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded text-red-600">
                Sign Out
              </button>
            </li>
          </ul>
        </div>
  );
};

