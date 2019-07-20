import { Input, Form, Modal, notification } from "antd";
import { FormComponentProps } from "antd/lib/form";

import { Component } from "react";

import { GaiaApi } from "@node-a-team/cosmosjs/dist/gaia/api";
import { Msg } from "@node-a-team/cosmosjs/dist/core/tx";
import { Coin } from "@node-a-team/cosmosjs/dist/common/coin";

const FormItem = Form.Item;
const { TextArea } = Input;

interface Props {
  api: GaiaApi;
  msgs: Msg[];
}

class SendTx extends Component<Props & FormComponentProps> {
  public static showModal(api: GaiaApi, msgs: Msg[]): void {
    let sendTx: any;

    const props: any = {
      api,
      msgs
    };

    Modal.confirm({
      className: "no-left-padding",
      width: 600,
      centered: true,
      content: (
        <SendTxForm
          {...props}
          ref={ref => {
            sendTx = ref;
          }}
        />
      ),
      title: "Send Tx",
      onOk: async () => {
        try {
          const args = await sendTx.validateFields();

          try {
            const result = await api.sendMsgs(
              msgs,
              {
                accountNumber:
                  args.accountNumber === "auto"
                    ? undefined
                    : args.accountNumber,
                sequence: args.sequence === "auto" ? undefined : args.sequence,
                fee: Coin.parse(args.fee),
                gas: args.gas,
                memo: args.memo ? args.memo : ""
              },
              "commit"
            );

            if (result.mode === "commit") {
              if (result.checkTx) {
                if (result.checkTx.code) {
                  notification.error({
                    message: "Fail to send tx",
                    description: result.checkTx.log
                  });
                  return;
                }
              }

              if (result.deliverTx) {
                if (
                  result.deliverTx.code === 0 ||
                  result.deliverTx.code === undefined
                ) {
                  notification.success({
                    message: "Success to send tx",
                    description: "Tx commited."
                  });
                  return;
                } else {
                  notification.error({
                    message: "Fail to send tx",
                    description: result.deliverTx.log
                  });
                  return;
                }
              }
            }
          } catch (e) {
            notification.error({
              message: "Fail to send tx",
              description: e.toString()
            });
          }
        } catch (e) {
          notification.error({
            message: "Invalid tx",
            description: JSON.stringify(e.errors)
          });
        }
      }
    });
  }

  public render() {
    const { msgs } = this.props;
    const { form } = this.props;

    let msgsJson = "";
    for (const msg of msgs) {
      msgsJson += msg.getSignBytes().toString();
    }

    return (
      <div className="container">
        <Form layout="horizontal">
          <FormItem
            label="Account number"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            colon={false}
          >
            {form.getFieldDecorator("accountNumber", {
              initialValue: "auto",
              rules: [
                {
                  required: true,
                  message: "Please input account number (auto|number)"
                },
                {
                  validator: (_, value: any): any => {
                    // Ignore when empty
                    if (!value) {
                      return true;
                    }

                    if (value === "auto") {
                      return true;
                    }

                    const parsed = parseInt(value, 10);
                    if (isNaN(parsed)) {
                      return false;
                    }

                    // Parse value to number by multiplying 1
                    if (value * 1 === parsed) {
                      if (parsed >= 0) {
                        return true;
                      }
                      return false;
                    } else {
                      return false;
                    }
                  },
                  message: "Invalid account number"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem
            label="Sequence"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            colon={false}
          >
            {form.getFieldDecorator("sequence", {
              initialValue: "auto",
              rules: [
                {
                  required: true,
                  message: "Please input sequence (auto|number)"
                },
                {
                  validator: (_, value: any): any => {
                    // Ignore when empty
                    if (!value) {
                      return true;
                    }

                    if (value === "auto") {
                      return true;
                    }

                    const parsed = parseInt(value, 10);
                    if (isNaN(parsed)) {
                      return false;
                    }

                    // Parse value to number by multiplying 1
                    if (value * 1 === parsed) {
                      if (parsed >= 0) {
                        return true;
                      }
                      return false;
                    } else {
                      return false;
                    }
                  },
                  message: "Invalid sequence"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem
            label="Gas"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            colon={false}
          >
            {form.getFieldDecorator("gas", {
              initialValue: "200000",
              rules: [
                {
                  required: true,
                  message: "Please input gas"
                },
                {
                  validator: (_, value: any): any => {
                    // Ignore when empty
                    if (!value) {
                      return true;
                    }

                    const parsed = parseInt(value, 10);
                    if (isNaN(parsed)) {
                      return false;
                    }

                    // Parse value to number by multiplying 1
                    if (value * 1 === parsed) {
                      if (parsed >= 0) {
                        return true;
                      }
                      return false;
                    } else {
                      return false;
                    }
                  },
                  message: "Invalid gas"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem
            label="Fee"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            colon={false}
          >
            {form.getFieldDecorator("fee", {
              initialValue: "5000 uatom",
              rules: [
                {
                  required: true,
                  message: "Please input fee"
                },
                {
                  validator: (_, value: any): any => {
                    // Ignore when empty
                    if (!value) {
                      return true;
                    }

                    try {
                      Coin.parse(value);
                      return true;
                    } catch {
                      return false;
                    }
                  },
                  message: "Invalid fee"
                }
              ]
            })(<Input />)}
          </FormItem>
          <FormItem
            label="Memo"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            colon={false}
          >
            {form.getFieldDecorator("memo", {
              initialValue: ""
            })(<Input />)}
          </FormItem>
          <FormItem
            label="Msgs"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            colon={false}
          >
            <TextArea className="white" rows={6} value={msgsJson} disabled />
          </FormItem>
        </Form>
        <style jsx>{`
          .container :global(.white) {
            background-color: white;
            color: rgba(0, 0, 0, 0.65);
          }
        `}</style>
      </div>
    );
  }
}

const SendTxForm = Form.create()(SendTx);
export default SendTxForm;
