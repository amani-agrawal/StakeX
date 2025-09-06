Things to do:
Algorand: Connect wallet, make payments, DAO

In the database:

Table 0: Login
id, email, password

Table 1: Users
id, name, age, email, address, phone, cart [list of ids], history orders[list of ids], ongoing bids[list of ids], their items to be sold [list of ids]

Table 2: Posts
id, name, image, description, value, owner id, bids [list of values], on_market [True/False to segragate which posts should show on feed and which are history]

Possible Table 3 for DAO -- Need to work on this