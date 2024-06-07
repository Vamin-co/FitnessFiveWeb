import React, { createContext, useState, useContext } from 'react';

const CardContext = createContext();

/**
 * Custom hook to access card context.
 * @returns {Object} The card context value.
 */
export const useCards = () => useContext(CardContext);

/**
 * CardProvider component that provides card-related state and functions.
 * @param {Object} props - React props.
 * @param {React.ReactNode} props.children - The child components.
 * @returns {JSX.Element} The CardContext provider.
 */
export const CardProvider = ({ children }) => {
  const [cards, setCards] = useState([]);

  /**
   * Adds a new card to the card list.
   * @param {Object} card - The card to add.
   */
  const addCard = card => {
    setCards(prevCards => [...prevCards, card]);
  };

  /**
   * Updates an existing card in the card list.
   * @param {number} id - The ID of the card to update.
   * @param {Object} updatedCard - The updated card data.
   */
  const updateCard = (id, updatedCard) => {
    setCards(prevCards => prevCards.map(card => card.id === id ? { ...card, ...updatedCard } : card));
  };

  /**
   * Removes a card from the card list.
   * @param {number} id - The ID of the card to remove.
   */
  const removeCard = id => {
    setCards(prevCards => prevCards.filter(card => card.id !== id));
  };

  return (
    <CardContext.Provider value={{ cards, addCard, updateCard, removeCard }}>
      {children}
    </CardContext.Provider>
  );
};
