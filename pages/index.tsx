import { Button, Form, Input } from "antd";
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

const FormItem = Form.Item;

interface State {
  api: GaiaApi | null;
  address: string;
}

class App extends Component<FormComponentProps & {}, State> {
  public readonly state: State = {
    api: null,
    address: ""
  };

  public render() {
    const { api, address } = this.state;
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
              <h3>Send</h3>
              <Form
                onSubmit={this.handleSubmit}
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
        `}</style>
        <style jsx global>{`
          .no-left-padding .ant-modal-confirm-content {
            margin-left: 0 !important;
          }
        `}</style>
      </div>
    );
  }

  private handleSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
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
        });
    });
  };
}

export default Form.create()(App);
