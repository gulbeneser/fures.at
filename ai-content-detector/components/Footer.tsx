import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center p-4 mt-8">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Powered by{' '}
        <a
          href="https://fures.at"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          fures
        </a>
        <span className="mx-2">·</span>
        <a
          href="#"
          onClick={(e) => e.preventDefault()} // Placeholder link
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          API Docs
        </a>
      </p>
    </footer>
  );
};

export default Footer;
