import React, { createContext, useState, useContext } from 'react';

const CardContext = createContext();

export const useCards = () => useContext(CardContext);

export const CardProvider = ({ children }) => {
  const [cards, setCards] = useState([]);

  const addCard = card => {
    setCards(prevCards => [...prevCards, card]);
  };

  const updateCard = (id, updatedCard) => {
    setCards(prevCards => prevCards.map(card => card.id === id ? { ...card, ...updatedCard } : card));
  };

  const removeCard = id => {
    setCards(prevCards => prevCards.filter(card => card.id !== id));
  };

  return (
    <CardContext.Provider value={{ cards, addCard, updateCard, removeCard }}>
      {children}
    </CardContext.Provider>
  );
};
