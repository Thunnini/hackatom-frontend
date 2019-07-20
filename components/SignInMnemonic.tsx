import { Button, Input, Form, Modal } from "antd";
import React, { Component } from "react";

import { NextPageContext } from "next";

import { RNG } from "@node-a-team/cosmosjs/dist/utils/key";
import {
  LocalWalletProvider,
  WalletProvider
} from "@node-a-team/cosmosjs/dist/core/walletProvider";
import { BIP44 } from "@node-a-team/cosmosjs/dist/core/bip44";
import { defaultBech32Config } from "@node-a-team/cosmosjs/dist/core/bech32Config";
import {
  useBech32Config,
  AccAddress
} from "@node-a-team/cosmosjs/dist/common/address";

import SignIn from "./SignIn";

import Cookie from "js-cookie";

const FormItem = Form.Item;

interface State {
  mnemonic: string;
  address: string;
}

export default class SignInMnemonic extends Component<{}, State>
  implements SignIn {
  public static async getInitialWalletProvider<R>(
    ctx: NextPageContext,
    onWalletProvided: (walletProvider: WalletProvider | undefined) => R
  ): Promise<R> {
    let mnemonic: string | undefined;
    if (typeof window === "undefined") {
      if (ctx.req) {
        const cookie = ctx.req!.headers.cookie;
        if (cookie) {
          let mnemonicInCookie = cookie;
          const start = cookie.indexOf("mnemonic=") + "mnemonic=".length;
          const end = cookie.indexOf(";", start);
          mnemonicInCookie = cookie.substring(
            start,
            end >= 0 ? end : undefined
          );
          mnemonic = mnemonicInCookie;
        }
      }
    } else {
      mnemonic = Cookie.get("mnemonic");
    }

    if (mnemonic) {
      while (mnemonic.indexOf("%20") >= 0) {
        mnemonic = mnemonic.replace("%20", " ");
      }
      const walletProvider = new LocalWalletProvider(mnemonic);
      return onWalletProvided(walletProvider);
    } else {
      return onWalletProvided(undefined);
    }
  }

  public static showModal(
    onWalletProvided: (walletProvider: WalletProvider) => void
  ): void {
    let signIn: SignIn | null = null;

    Modal.confirm({
      className: "no-left-padding",
      content: (
        <SignInMnemonic
          ref={ref => {
            signIn = ref;
          }}
        />
      ),
      title: "Sign in with mnemonic",
      onOk: () => {
        onWalletProvided(signIn!.getWalletProvider());
      }
    });
  }

  public static clear(): void {
    Cookie.remove("mnemonic");
  }

  public readonly state: State;

  constructor(props: any) {
    super(props);

    const state = {
      mnemonic: "",
      address: ""
    };

    this.state = state;
  }

  public render() {
    const { address, mnemonic } = this.state;

    return (
      <div className="container">
        <Form
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <FormItem label="Mnemonic" colon={false}>
            <Input
              value={mnemonic}
              onChange={e => this.setMnemonic(e.target.value)}
            />
          </FormItem>
          <FormItem label="Address" colon={false}>
            <Input disabled={true} value={address} />
          </FormItem>
          <FormItem colon={false} wrapperCol={{ span: 18, offset: 6 }}>
            <Button type="primary" onClick={this.generate}>
              Generate
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }

  public getWalletProvider(): WalletProvider {
    Cookie.set("mnemonic", this.state.mnemonic);
    return new LocalWalletProvider(this.state.mnemonic, this.rng());
  }

  private generate = () => {
    this.setMnemonic(LocalWalletProvider.generateMnemonic(this.rng()));
  };

  private setMnemonic(mnemonic: string) {
    this.setState({
      mnemonic,
      address: this.getAddressFromMnemonic(mnemonic)
    });
  }
  private getAddressFromMnemonic(mnemonic: string): string {
    const bech32 = defaultBech32Config("zone");

    const privKey = LocalWalletProvider.getPrivKeyFromMnemonic(
      new BIP44(44, 118, 0),
      mnemonic,
      0,
      0
    );
    const pubKey = privKey.toPubKey();
    const address = pubKey.toAddress();

    return useBech32Config(bech32, () => {
      const accAddress = new AccAddress(address);
      return accAddress.toBech32();
    });
  }

  private rng(): RNG {
    return array => {
      return crypto.getRandomValues(array);
    };
  }
}
