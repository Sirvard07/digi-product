import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm, onSearchClick, currentColor }) => {
    return (
        <div className='flex justify-start -mt-6 mb-10'>
            <input 
              className='p-2 border-2 br-10 rounded-md'
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            &nbsp;
            <button 
              onClick={onSearchClick}
              style={{ backgroundColor: currentColor, borderRadius: "10px" }}
              className="text-md text-white hover:drop-shadow-xl p-3 hover:bg-gray"
            >
              Search
            </button>
        </div>
    );
};

export default SearchBar;
