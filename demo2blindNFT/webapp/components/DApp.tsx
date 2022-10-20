import { useEffect, useState } from "react";
import { ethers } from "ethers";

import {
  useAccount,
  useBalance,
  useConnect,
  useContractRead,
  useContractWrite,
  useSigner,
} from "wagmi";

import { Modal, Button } from "antd";
import 'antd/dist/antd.css';
import TripNFTArtifact from "../contracts/TripNFT.json";
import TestGreetingArtifact from "../contracts/TestGreeting.json";
import contractAddress from "../contracts/contract-address.json";
import BgImage from "./BgImage";

import styles from "../styles/DApp.module.css";

// Mint合约的配置
// TODO: 依据不同环境不同配置（加入生产环境配置）
const nftContractConfig = {
  addressOrName: contractAddress.TripNFT,
  contractInterface: TripNFTArtifact.abi,
};

const greetContractConfig = {
  addressOrName: contractAddress.TestGreeting,
  contractInterface: TestGreetingArtifact.abi,
};

const DApp = () => {
  // 当前用户的地址
  const { address: currentAddress, isConnected } = useAccount();
  // 用户余额
  const { data: balanceData } = useBalance({ addressOrName: currentAddress });
  // 以太坊网络提供方provider与singer
  const { data: signer, isError, isLoading } = useSigner();
  // NFT Contract Object
  const { writeAsync: mintAsync, error: mintError } = useContractWrite({
    ...nftContractConfig,
    mode: "recklesslyUnprepared",
    functionName: "mintNft",
  });
  // 通过读取合约字段活动铸造售价
  const { data: mintPrice } = useContractRead({
    ...nftContractConfig,
    functionName: "mintPrice",
  });
  // TODO：之后改为读取合约的白名单字段
  const isInWhiteList = true;
  // 本地调试用，查看是否正确连接至合约
  const { data: greetMsg } = useContractRead({
    ...greetContractConfig,
    functionName: "greet",
  });
  // 倒计时时钟指针
  let countDownPointer: ReturnType<typeof setInterval> | null;
  // 倒计时文案
  const [countDownText, setCountDownText] = useState("--:--:--");
  // mint按钮状态
  const [isMintLoading, setMintLoading] = useState(false);

  // 连接钱包
  const { connect, connectors } = useConnect();

  useEffect(() => {
    startCountDown();
    return () => {
      clearInterval(countDownPointer);
    };
  }, []);

  // 连接钱包
  const connectWallet = async () => {
    // TODO: more wallet
    const MetaMaskConnector = connectors[0];
    await connect({ connector: MetaMaskConnector });
    console.log("connectWallet Successful!");
  };

  // 铸造请求
  const requestMint = async () => {
    // 还未读取到合约方法
    if (!mintAsync) return;

    setMintLoading(true);

    try {
      const tx = await mintAsync({
        recklesslySetUnpreparedArgs: [1, currentAddress],
        recklesslySetUnpreparedOverrides: {
          from: currentAddress,
          value: mintPrice, // 传入合约里的售价
        },
      });

      const receipt = await tx.wait();
      console.log({ receipt });
      Modal.success({
        title: "Mint成功！",
        content: "点击OK前往OpenSea查看",
        onOk: () => {
          window.open("https://testnets.opensea.io/zh-CN/collections","_blank")
        },
        centered: true,
      })
    } catch (error) {
      console.error(error);
      Modal.error({
        title: "Mint failed!",
        content: "Something went wrong...",
        centered: true,
      })
    } finally {
      setMintLoading(false);
    }
  };

  const startCountDown = () => {
    countDownPointer = setInterval(() => {
      const restTotalSeconds = (new Date("2022/10/25") - new Date()) / 1000;
      const seconds = Math.floor(restTotalSeconds % 60);
      const minutes = Math.floor((restTotalSeconds / 60) % 60);
      const hours = Math.floor((restTotalSeconds / 60 / 60) % 24);
      const days = Math.floor(restTotalSeconds / 60 / 60 / 24);

      setCountDownText(`${days} days ${hours}:${minutes}:${seconds}`);
    }, 1000);
  };

  const renderConnector = () => {
    return (
      <div>
        {isConnected ? (
          <button
            type="button"
            onClick={connectWallet}
            className={styles.walletWelcome}
          >
            Welcome {`0x...${currentAddress?.substr(-4)}`}!
          </button>
        ) : (
          <button
            className={styles.walletLogin}
            type="button"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
      </div>
    );
  };

  const renderMintButton = () => {
    const isAble = currentAddress && isInWhiteList && !isMintLoading;
    const btnText = !currentAddress
      ? "Connect wallet first."
      : !isInWhiteList
      ? "You are not qualified to buy."
      : isMintLoading
      ? "Minting..."
      : "MINT!";

    return (
      <div className="mt-10">
        <button
          className={isAble ? styles.mintAble : styles.mintDisable}
          type="button"
          onClick={() => isAble && requestMint()}
        >
          <span className="font-bold text-xl">{btnText}</span>
        </button>
      </div>
    );
  };

  // 4. 初始化完毕后
  return (
    <div
      className="container relative h-full w-full p-8 bg-white rounded-xl shadow-2xl"
      style={{
        backgroundImage: "linear-gradient(to top, #dfe9f3  0%, #ffffff 100%)",
      }}
    >
      <BgImage />

      <div className="relative">
        {renderConnector()}

        <h1 className="text-black font-bold text-5xl mt-10">{greetMsg}</h1>

        <h1 className="text-black font-bold text-3xl mt-10">
          Whitelist Sale Util In: <br />
          {`${countDownText}`}
        </h1>

        {renderMintButton()}
      </div>
    </div>
  );
};

export default DApp;
