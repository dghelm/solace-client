# client

### The solace.fi web interface

## Where do I start reading through this code?

---

Start with src/index, it's the entry point.

## How to start testing locally

---

Note: This project was originally developed alongside the Hardhat framework.

Install dependencies

    npm install

Run the following commands from the core directory

    npx hardhat compile
    npx hardhat node

In a different terminal, run the following commands from the core directory

    npx hardhat run --network localhost scripts/deploy.ts

After the deploy script is ran, copy the contract addresses into the appropriate network file at client/src/config. Be sure that the name of the contract matches the name of the object within the config file.

Run using the following react command from the client directory

    npm start

## Project Structure

    src/
    |___components/
        |___atoms/
        |___molecules/
        |___organisms/
    |___networks/
    |___constants/
    |   |____abi/
    |___context/
    |   |____GeneralManager
    |   |____ContractsManager
    |   |____NotificationsManager
    |   |____ProviderManager
    |   |____UserDataManager
    |   |____WalletManager
    |___wallet/
    |   |____wallet-connectors/
    |___hooks/
    |___pages/
    |   |____dashboard/
    |   |____govern/
    |   |____invest/
    |   |____quote/
    |   |____about/
    |   |____App
    |___resources/
    |___products/
    |___styles/
    |___utils/

## React Context Structure

    <GeneralProvider>                  // user-related data
      <NetworkManager>                 // network management
        <WalletManager>                // wallet connection
          <ProviderManager>            // network-wallet mediator
            <CachedDataManager>        // cached data
              <ContractsManager>       // contracts
                <NotificationsManager> // notifications and toasts
                  ...
                </NotificationsManager>
              </ContractsManager>
            </CachedDataManager>
          </ProviderManager>
        </WalletManager>
      </NetworkManager>
    </GeneralProvider>

GeneralManager allows access to the theme, user preferences and other data that should be at the top of the data flow.

NetworkManager allows access to current network and its configuration.

WalletManager allows access to web3-react and wallet connection functionalities.

ProviderManager allows functions from Network and Wallet Managers to work together.

CachedDataManager allows the app to access data that is already cached onto the app.

ContractsManager allows centralized access to contracts.

NotificationsManager allows the app to create notifications for the user.

## Beginning Design Decisions

There are two git repositories that initially influenced the design direction of this application, [Barnbridge](https://github.com/BarnBridge/barnbridge-frontend)
and [Uniswap](https://github.com/Uniswap/uniswap-interface).

At the time of writing, Barnbridge utilized Web3 and React Context, while Uniswap utilized Redux and Ethers, but they both used Web3-react. To make the most of our application, we tried to get the best of both worlds using the following stack: React Context, Ethers, and Web3-React.

There was also a difference in the organization of connectors and contracts observed in both repositories. Barnbridge centralized all of its contracts into a single Context provider, while Uniswap centralized contract hooks and molded its contract functions into hooks that are called by different components of the application. This application was able to mesh the two types of organizations together. Over time, the design of the app was slowly following Barnbridge's direction.
