import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { formatCurrency } from '@/utils/savings'
import { format } from 'date-fns'

interface SavingsModalProps {
  isOpen: boolean
  closeModal: () => void
  day: {
    day: number
    date: Date
    amount: number
  }
  onSave: () => void
  onDelete: () => void
  isSaved: boolean
}

export default function SavingsModal({ isOpen, closeModal, day, onSave, onDelete, isSaved }: SavingsModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800/90 backdrop-blur p-6 text-left align-middle shadow-xl transition-all border border-slate-700">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-slate-200 mb-4"
                >
                  Thông tin tiết kiệm
                </Dialog.Title>
                <div className="space-y-3">
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">Ngày thứ</p>
                    <p className="text-lg font-medium text-slate-200">{day.day}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">Ngày tháng</p>
                    <p className="text-lg font-medium text-slate-200">{format(day.date, 'dd/MM/yyyy')}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">Số tiền cần tiết kiệm</p>
                    <p className="text-lg font-medium text-emerald-400">{formatCurrency(day.amount)}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  {!isSaved ? (
                    <button
                      type="button"
                      className="flex-1 justify-center rounded-md border border-emerald-700 bg-emerald-900/50 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-900/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-colors"
                      onClick={onSave}
                    >
                      Đã tiết kiệm
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex-1 justify-center rounded-md border border-red-700 bg-red-900/50 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-900/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors"
                      onClick={onDelete}
                    >
                      Xóa tiết kiệm
                    </button>
                  )}
                  <button
                    type="button"
                    className="flex-1 justify-center rounded-md border border-slate-600 bg-slate-700/50 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 transition-colors"
                    onClick={closeModal}
                  >
                    Đóng
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 