import { useState, createContext, useContext } from "react";
import products from "../data/products";
import { initiateCheckout } from "../stripe/initiateCheckout";

const defaultBag = {
  products: {},
};

export const BagContext = createContext({});

export const useBagState = () => {
  const [bag, updateBag] = useState(defaultBag);

  const bagItems = Object.keys(bag.products).map((key) => {
    const product = products.find(({ price: { id } }) => id === key);
    return {
      ...bag.products[key],
      pricePerItem: product.price.amount,
    };
  });

  const totalItems = bagItems.reduce((accumulator, { quantity }) => {
    return accumulator + quantity;
  }, 0);

  const checkoutDisabled = totalItems < 1;

  const totalCost = bagItems.reduce(
    (accumulator, { quantity, pricePerItem }) => {
      return accumulator + pricePerItem * quantity;
    },
    0
  );

  const addToBag = ({ id }) => {
    const prevBag = bag;
    const products = { ...bag.products };

    if (products[id]) {
      products[id].quantity++;
    } else {
      products[id] = { id, quantity: 1 };
    }

    updateBag({ ...prevBag, products });
  };

  const checkout = () => {
    const lineItems = bagItems.map(({ id, quantity }) => {
      return { price: id, quantity };
    });

    initiateCheckout({ lineItems });
  };

  return {
    addToBag,
    checkout,
    checkoutDisabled,
    totalCost,
    totalItems,
  };
};

export const useBag = () => {
  const bag = useContext(BagContext);
  return bag;
};
