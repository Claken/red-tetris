import React from 'react';

function NotFoundPage() {
  return (
	<div data-testid="not-found-page" className="bg-black h-screen">
		<div className="flex items-center justify-center h-screen">
		<h1 className="text-white text-3xl">404 - NOT FOUND</h1>
		</div>
	</div>
  );
}

export default NotFoundPage;