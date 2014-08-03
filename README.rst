This is a readme!

.. code-block:: python

    import pydealer

    deck = pydealer.Deck()
    hand = pydealer.Stack()

    deck.shuffle()

    dealt_cards = deck.deal(7)

    hand.add(dealt_cards)

    for card in hand:
        print card