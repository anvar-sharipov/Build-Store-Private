import React, { useEffect, useState } from 'react'
import myAxios from '../../axios'

const Entries = () => {
  const [transactions, setTransactions] = useState([])
  const [partners, setPartners] = useState([])
  const [accounts, setAccounts] = useState([])
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    partnerId: '',
  })
  const [loading, setLoading] = useState(false)

  // Для новой проводки
  const [newTx, setNewTx] = useState({
    description: '',
    partner: '', // id партнера, если есть
    entries: [
      { account_id: '', debit: '', credit: '' }
    ],
  })

  // Загрузка данных
  useEffect(() => {
    fetchPartners()
    fetchAccounts()
    fetchTransactions()
  }, [])

  const fetchPartners = async () => {
    try {
      const res = await myAxios.get('/partners/')
      setPartners(res.data)
    } catch (err) {
      console.error('Ошибка загрузки партнёров:', err)
    }
  }

  const fetchAccounts = async () => {
    try {
      const res = await myAxios.get('/accounts/')
      setAccounts(res.data)
    } catch (err) {
      console.error('Ошибка загрузки счетов:', err)
    }
  }

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = {}

      if (filters.dateFrom) params.date__gte = filters.dateFrom
      if (filters.dateTo) params.date__lte = filters.dateTo
      if (filters.partnerId) params.partner = filters.partnerId

      const res = await myAxios.get('/transactions/', { params })
      setTransactions(res.data)
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err)
    } finally {
      setLoading(false)
    }
  }

  // Обработчики фильтров
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleApplyFilters = () => {
    fetchTransactions()
  }

  // Обработчики новой проводки
  const handleNewTxChange = (e) => {
    setNewTx({ ...newTx, [e.target.name]: e.target.value })
  }

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...newTx.entries]
    updatedEntries[index][field] = value
    setNewTx({ ...newTx, entries: updatedEntries })
  }

  const addEntryLine = () => {
    setNewTx({
      ...newTx,
      entries: [...newTx.entries, { account_id: '', debit: '', credit: '' }]
    })
  }

  const removeEntryLine = (index) => {
    const updatedEntries = newTx.entries.filter((_, i) => i !== index)
    setNewTx({ ...newTx, entries: updatedEntries })
  }

  const createTransaction = async () => {
    // Валидация: хотя бы 1 строка с суммой
    if (!newTx.description.trim()) {
      alert('Введите описание')
      return
    }
    if (newTx.entries.length === 0) {
      alert('Добавьте хотя бы одну проводку')
      return
    }

    // Отправка
    try {
      console.log('newTx', newTx);
      
      await myAxios.post('/transactions/', newTx)
      alert('Проводка создана')
      setNewTx({
        description: '',
        partner: '',
        entries: [{ account_id: '', debit: '', credit: '' }],
      })
      fetchTransactions()
    } catch (err) {
      console.error(err)
      alert('Ошибка при создании проводки')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Проводки</h2>

      {/* Фильтр */}
      <div className="mb-4 flex gap-2 items-end">
        <div>
          <label>Дата от:</label>
          <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="border p-1" />
        </div>
        <div>
          <label>Дата до:</label>
          <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="border p-1" />
        </div>
        <div>
          <label>Партнёр:</label>
          <select name="partnerId" value={filters.partnerId} onChange={handleFilterChange} className="border p-1">
            <option value="">Все</option>
            {partners.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleApplyFilters} className="bg-blue-500 text-white px-3 py-1 rounded">
          Применить
        </button>
      </div>

      {/* Форма создания новой проводки */}
      <div className="border p-4 rounded shadow mb-8">
        <h3 className="text-lg font-semibold mb-2">Создать новую проводку</h3>
        <input
          type="text"
          name="description"
          placeholder="Описание"
          value={newTx.description}
          onChange={handleNewTxChange}
          className="border p-2 w-full mb-2"
        />
        <div className="mb-2">
          <label>Партнёр:</label>
          <select
            name="partner"
            value={newTx.partner}
            onChange={handleNewTxChange}
            className="border p-1 w-full"
          >
            <option value="">Без партнёра</option>
            {partners.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Строки проводок */}
        {newTx.entries.map((entry, idx) => (
          <div key={idx} className="flex gap-2 mb-2 items-center">
            <select
              className="border p-1 flex-grow"
              value={entry.account_id}
              onChange={(e) => handleEntryChange(idx, 'account_id', e.target.value)}
            >
              <option value="">Счёт</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.number} — {acc.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Дебет"
              value={entry.debit}
              onChange={(e) => handleEntryChange(idx, 'debit', e.target.value)}
              className="border p-1 w-24"
            />
            <input
              type="number"
              placeholder="Кредит"
              value={entry.credit}
              onChange={(e) => handleEntryChange(idx, 'credit', e.target.value)}
              className="border p-1 w-24"
            />
            <button
              onClick={() => removeEntryLine(idx)}
              className="text-red-600 font-bold px-2"
              title="Удалить строку"
              type="button"
            >
              ×
            </button>
          </div>
        ))}

        <button onClick={addEntryLine} className="text-blue-600 text-sm mb-2">
          + Добавить строку
        </button>
        <br />
        <button
          onClick={createTransaction}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Сохранить проводку
        </button>
      </div>

      {/* Список проводок */}
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        transactions.map((tx) => (
          <div key={tx.id} className="border p-4 mb-4 rounded shadow">
            <div className="font-semibold">{new Date(tx.date).toLocaleString()}</div>
            <div className="italic text-gray-700">{tx.description}</div>

            <table className="w-full mt-2 text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th>Счёт</th>
                  <th>Название</th>
                  <th>Дебет</th>
                  <th>Кредит</th>
                </tr>
              </thead>
              <tbody>
                {tx.entries.map((entry) => (
                  <tr key={entry.id} className="border-b">
                    <td>{entry.account.number}</td>
                    <td>{entry.account.name}</td>
                    <td>{parseFloat(entry.debit) > 0 ? entry.debit : ''}</td>
                    <td>{parseFloat(entry.credit) > 0 ? entry.credit : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  )
}

export default Entries
