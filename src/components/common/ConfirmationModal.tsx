import React from 'react';
import { AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  affectedItemsCount?: number;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد الحذف',
  cancelText = 'إلغاء',
  type = 'danger',
  affectedItemsCount,
}) => {
  const isDanger = type === 'danger';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-sm flex items-center gap-2 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-[#25A09F] hover:bg-[#1E807F] shadow-teal-200'
            }`}
          >
            {isDanger ? <Trash2 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {confirmText}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div
          className={`p-3 rounded-2xl shrink-0 ${
            isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-700 leading-relaxed font-medium">{message}</p>
          {affectedItemsCount !== undefined && affectedItemsCount > 0 && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              ⚠️ تنبيه: هذه العملية قد تؤثر على {affectedItemsCount} عناصر وجداول مرتبطة.
            </div>
          )}
          <p className="text-xs text-slate-400">
            سيتم توثيق هذا الإجراء وتاريخه تلقائيًا في سجل العمليات (Activity Log).
          </p>
        </div>
      </div>
    </Modal>
  );
};
