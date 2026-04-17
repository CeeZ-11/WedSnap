import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Camera, Grid, Play } from 'lucide-react';
import { motion } from 'framer-motion';
export function Navbar() {
  const location = useLocation();
  // Don't show navbar on slideshow page
  if (location.pathname === '/slideshow') {
    return null;
  }
  const navItems = [
  {
    path: '/',
    icon: Camera,
    label: 'Upload'
  },
  {
    path: '/gallery',
    icon: Grid,
    label: 'Gallery'
  },
  {
    path: '/slideshow',
    icon: Play,
    label: 'Slideshow'
  }];

  return (
    <>
      {/* Desktop Top Nav */}
      <nav className="hidden md:flex fixed top-0 w-full bg-ivory/90 backdrop-blur-md z-40 border-b border-warm-beige px-8 py-4 justify-between items-center">
        <div className="font-serif text-2xl font-medium text-dark">
          Seamor & Lady Stephanie
        </div>
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex items-center space-x-2 text-sm font-medium transition-colors ${isActive ? 'text-gold' : 'text-dark hover:text-gold/70'}`}>
                
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive &&
                <motion.div
                  layoutId="desktop-nav-indicator"
                  className="absolute -bottom-5 left-0 right-0 h-0.5 bg-gold"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }} />

                }
              </NavLink>);

          })}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-ivory/95 backdrop-blur-lg z-40 border-t border-warm-beige pb-safe">
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-gold' : 'text-dark/60 hover:text-dark'}`}>
                
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive &&
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 w-12 h-0.5 bg-gold rounded-b-full"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }} />

                }
              </NavLink>);

          })}
        </div>
      </nav>
    </>);

}