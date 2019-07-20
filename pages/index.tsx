import { Button, Form, Input, notification } from "antd";
import { FormComponentProps } from "antd/lib/form";
import React, { Component } from "react";

import SignInMnemonic from "../components/SignInMnemonic";
import SendTx from "../components/SendTx";

import { defaultBech32Config } from "@node-a-team/cosmosjs/dist/core/bech32Config";
import { GaiaApi } from "@node-a-team/cosmosjs/dist/gaia/api";
import { AccAddress } from "@node-a-team/cosmosjs/dist/common/address";
import { WalletProvider } from "@node-a-team/cosmosjs/dist/core/walletProvider";
import { Coin } from "@node-a-team/cosmosjs/dist/common/coin";

import { MsgSend } from "@node-a-team/cosmosjs/dist/gaia/msgs/bank";
import { MsgSwap } from "@node-a-team/cosmosjs/dist/gaia/msgs/swap";

const FormItem = Form.Item;

interface State {
  api: GaiaApi | null;
  address: string;
  coins: string;
}

class App extends Component<FormComponentProps & {}, State> {
  public readonly state: State = {
    api: null,
    address: "",
    coins: ""
  };

  public render() {
    const { api, address, coins } = this.state;
    const { form } = this.props;

    return (
      <div>
        <div className="container" style={{ paddingTop: 100 }}>
          {api ? (
            <div className="signed-in">
              <h3>Account</h3>
              <Form
                layout="horizontal"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 8 }}
              >
                <FormItem label="Address" colon={false}>
                  <Input disabled={true} value={address} className="white" />
                </FormItem>
              </Form>
              <Form
                layout="horizontal"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 8 }}
              >
                <FormItem label="Coins" colon={false}>
                  <Input disabled={true} value={coins} className="white" />
                </FormItem>
              </Form>
              <h3>Send</h3>
              <Form
                onSubmit={this.handleSend}
                layout="horizontal"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 8 }}
              >
                <FormItem label="To" colon={false}>
                  {form.getFieldDecorator("to", {
                    rules: [
                      {
                        required: true,
                        message: "Please input to address"
                      },
                      {
                        validator: (_, value: any): any => {
                          try {
                            AccAddress.fromBech32(value);
                            return true;
                          } catch {
                            return false;
                          }
                        },
                        message: "Invalid address"
                      }
                    ]
                  })(<Input />)}
                </FormItem>
                <FormItem label="Amount" colon={false}>
                  {form.getFieldDecorator("amount", {
                    rules: [
                      {
                        required: true,
                        message: "Please input the amount to send"
                      },
                      {
                        validator: (_, value: any): any => {
                          try {
                            Coin.parse(value);
                            return true;
                          } catch {
                            return false;
                          }
                        },
                        message: "Invalid amount"
                      }
                    ]
                  })(<Input />)}
                </FormItem>
                <FormItem colon={false} wrapperCol={{ span: 8, offset: 8 }}>
                  <Button type="primary" htmlType="submit">
                    Send
                  </Button>
                </FormItem>
              </Form>
              <h3 className="middle">
                <img
                  src="https://media1.tenor.com/images/abb9bb0bb79865bfc4ac963d4c30eb7a/tenor.gif?itemid=11191352"
                  id="doge"
                  className="middle"
                ></img>
                Swap
              </h3>
              <Form
                onSubmit={this.handleSwap}
                layout="horizontal"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 8 }}
              >
                <FormItem label="Asset" colon={false}>
                  {form.getFieldDecorator("asset", {
                    rules: [
                      {
                        required: true,
                        message: "Please input the amount to swap"
                      },
                      {
                        validator: (_, value: any): any => {
                          try {
                            Coin.parse(value);
                            return true;
                          } catch {
                            return false;
                          }
                        },
                        message: "Invalid amount"
                      }
                    ]
                  })(<Input />)}
                </FormItem>
                <FormItem label="Target" colon={false}>
                  {form.getFieldDecorator("target", {
                    rules: [
                      {
                        required: true,
                        message: "Please input the denom to receive"
                      }
                    ]
                  })(<Input />)}
                </FormItem>
                <FormItem colon={false} wrapperCol={{ span: 8, offset: 8 }}>
                  <Button type="primary" htmlType="submit">
                    Swap
                  </Button>
                </FormItem>
              </Form>
            </div>
          ) : (
            <div className="need-sign">
              <Form layout="horizontal">
                <FormItem
                  label="Sign in"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 8 }}
                  colon={false}
                >
                  <Button.Group size="large">
                    <Button
                      type="primary"
                      onClick={this.openSignInMnemonicModal}
                    >
                      Nano ledger
                    </Button>
                    <Button
                      type="primary"
                      onClick={this.openSignInMnemonicModal}
                    >
                      Mnemonic
                    </Button>
                  </Button.Group>
                </FormItem>
              </Form>
            </div>
          )}
        </div>
        <style jsx>{`
          .container :global(.white) {
            background-color: white;
            color: rgba(0, 0, 0, 0.65);
          }

          .container h3 {
            text-align: center;
          }

          .center {
            text-align: center;
          }

          #doge {
            height: 40px;
          }
        `}</style>
        <style jsx global>{`
          .no-left-padding .ant-modal-confirm-content {
            margin-left: 0 !important;
          }
        `}</style>
      </div>
    );
  }

  private handleSend = (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(["to", "amount"], (err, values) => {
      if (!err) {
        const msg = new MsgSend(
          AccAddress.fromBech32(this.state.address),
          AccAddress.fromBech32(values.to),
          [Coin.parse(values.amount)]
        );

        SendTx.showModal(this.state.api!, [msg]);
      }
    });
  };

  private handleSwap = (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(["asset", "target"], (err, values) => {
      if (!err) {
        const msg = new MsgSwap(
          AccAddress.fromBech32(this.state.address),
          Coin.parse(values.asset),
          values.target as string
        );

        SendTx.showModal(this.state.api!, [msg]);
      }
    });
  };

  private openSignInMnemonicModal = () => {
    SignInMnemonic.showModal((walletProvider: WalletProvider) => {
      const api = new GaiaApi(
        {
          chainId: "zone-1",
          walletProvider,
          rpc: "http://localhost:16657",
          rest: "http://localhost:1317"
        },
        {
          bech32Config: defaultBech32Config("zone")
        }
      );

      api
        .signIn(0)
        .then(() => {
          return api.wallet.getSignerAccounts(api.context);
        })
        .then(accounts => {
          const address = accounts[0].address;
          const accAddress = new AccAddress(address);

          this.setState({
            api,
            address: accAddress.toBech32()
          });

          this.updateAccountCoins();
        })
        .catch(e => {
          notification.error({
            message: "Fail to sign in",
            description: e.toString()
          });

          this.setState({
            api: null,
            address: "",
            coins: ""
          });
        });
    });
  };

  private async updateAccountCoins(): Promise<void> {
    const { api } = this.state;
    if (!api) {
      return;
    }

    try {
      const account = await api.rest.getAccount(this.state.address);
      let coins = "";

      for (const coin of account.getCoins()) {
        coins += coin.amount.toString() + coin.denom + " ";
      }

      this.setState({
        coins
      });
    } catch (e) {
      notification.error({
        message: "Fail to fetch account",
        description: e.toString()
      });
    }
  }
}

export default Form.create()(App);
