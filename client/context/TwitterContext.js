import { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { client } from '../lib/client'

export const TwitterContext = createContext()

export const TwitterProvider = ({ children }) => {
  const [appStatus, setAppStatus] = useState('loading')
  const [currentAccount, setCurrentAccount] = useState('')
  const [tweets, setTweets] = useState([])
  const [currentUser, setCurrentUser] = useState({})

  const router = useRouter()

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    if (!currentAccount || appStatus !== 'connected') return
    getCurrentUserDetails(currentAccount)
    fetchTweets()
  }, [currentAccount, appStatus])

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setAppStatus('noMetaMask')
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_accounts',
      })
      if (addressArray.length > 0) {
        setAppStatus('connected')
        setCurrentAccount(addressArray[0])
        createUserAccount(addressArray[0])
      } else {
        router.push('/')
        setAppStatus('notConnected')
      }
    } catch (error) {
      router.push('/')
      setAppStatus(error)
    }
  }

  const connectToWallet = async () => {
    if (!window.ethereum) return setAppStatus('noMetamask')
    try {
      setAppStatus('loading')
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      if (addressArray.length > 0) {
        setAppStatus('connected')
        setCurrentAccount(addressArray[0])
        createUserAccount(addressArray[0])
      } else {
        router.push('/')
        setAppStatus('notConnected')
      }
    } catch (error) {
      setAppStatus('error')
    }
  }

  const createUserAccount = async (userWalletAddress = currentAccount) => {
    if (!window.ethereum) return setAppStatus('noMetaMask')
    try {
      const userDoc = {
        _type: 'users',
        _id: userWalletAddress,
        name: 'Unnamed',
        isProfileImageNft: false,
        profileImage:
          'https://i.pinimg.com/736x/36/6b/6b/366b6be0f82b010e0d8ce01331e8657a.jpg',
        coverImage:
          'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.angelxp.eu%2Fimage%2FTwitter%2Fanime%2Fnaruto08.jpg&f=1&nofb=1',
        walletAddress: userWalletAddress,
      }
      await client.createIfNotExists(userDoc)
      setAppStatus('connected')
    } catch (error) {
      router.push('/')
      setAppStatus('error')
    }
  }

  const getProfileImageUrl = async  (imageUri, isNft) => {
    if(isNft){
      return `https://gateway.pinata.cloud/ipfs/${imageUri}`
    }else {
      return ima
    }
  }

  const fetchTweets = async () => {
    const query = `
    *[_type == "tweets"]{
      "author": author->{name,walletAddress,profileImage,isProfileImageNft},
      tweet,
      timestamp
    }|order(timestamp desc)
    `

    const sanityResponse = await client.fetch(query)

    setTweets([])

    sanityResponse.forEach(async (items) => {

      const profileImageUrl =  await getProfileImageUrl(
        items.author.profileImage,
        items.author.isProfileImageNft
      )

      const newItem = {
        tweet: items.tweet,
        timestamp: items.timestamp,
        author: {
          name: items.author.name,
          walletAddress: items.author.walletAddress,
          isProfileImageNft: items.author.isProfileImageNft,
          profileImage: profileImageUrl,
        },
      }
      setTweets((prevState) => [...prevState, newItem])
    })
  }

  const getCurrentUserDetails = async (userAccount = currentAccount) => {
    if (appStatus !== 'connected') return

    const query = `
      *[_type == "users" && _id == "${userAccount}"]{
        "tweets": tweets[]->{timestamp, tweet}|order(timestamp desc),
        name,
        profileImage,
        isProfileImageNft,
        coverImage,
        walletAddress
      }
    `
    const sanityResponse = await client.fetch(query)

    const profileImageUri = await getProfileImageUrl(
      sanityResponse[0].profileImage,
      sanityResponse[0].isProfileImageNft,
    )
    if (sanityResponse[0] != undefined) {


      setCurrentUser({  
        tweets: sanityResponse[0].tweets,
        name: sanityResponse[0].name,
        profileImage: profileImageUri,
        isProfileImageNft: sanityResponse[0].isProfileImageNft,
        walletAddress: sanityResponse[0].walletAddress,
        coverImage: sanityResponse[0].coverImage,
      })
    }
  }

  return (
    <TwitterContext.Provider
      value={{
        appStatus,
        setAppStatus,
        currentAccount,
        connectToWallet,
        fetchTweets,
        tweets,
        currentUser,
        getCurrentUserDetails,
      }}
    >
      {children}
    </TwitterContext.Provider>
  )
}

// 1:17:07
