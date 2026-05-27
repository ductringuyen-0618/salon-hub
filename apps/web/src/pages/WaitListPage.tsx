import React from 'react';
import Navigation from '@/components/Navigation';
import WaitListBoard from '@/components/WaitListBoard';

const WaitListPage = () => {
  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation
        title="Wait List"
        subtitle="Current queue and wait times"
      />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        <WaitListBoard />
      </main>
    </div>
  );
};

export default WaitListPage;
