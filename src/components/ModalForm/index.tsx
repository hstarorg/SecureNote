import { Form, FormProps, Modal, ModalProps } from 'antd';
import { PropsWithChildren } from 'react';

export type ModalFormProps = {
  open?: boolean;
  title?: string;
  onSubmit?: (values: any) => void;
  onCancel?: () => void;
  modalProps?: Partial<
    Omit<ModalProps, 'open' | 'title' | 'onOk' | 'onCancel'>
  >;
  formProps?: Partial<Omit<FormProps, 'form'>>;
};
export function ModalForm(props: PropsWithChildren<ModalFormProps>) {
  const {
    title,
    children,
    modalProps = {},
    formProps = {},
    open,
    onCancel,
    onSubmit,
  } = props;
  const [form] = Form.useForm();

  function handleOk() {
    form.validateFields().then((value) => {
      onSubmit?.(value);
    });
  }

  return (
    <Modal
      {...modalProps}
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Form {...formProps} form={form}>
        {children}
      </Form>
    </Modal>
  );
}
