import React, { useEffect, useState } from 'react'
import myAxios from '../../../../axios'

const AccountReports = () => {
  const [accounts, setAccounts] = useState([])
  const [entries, setEntries] = useState([])
  const [filters, setFilters] = useState({
    account: '',
    dateFrom: '',
    dateTo: ''
  })

  const [totals, setTotals] = useState({ debit: 0, credit: 0 })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await myAxios.get('/accounts/')
      setAccounts(res.data)
    } catch (err) {
      console.error('Ошибка загрузки счетов:', err)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const fetchEntries = async () => {
    try {
      const params = {}
      console.log('filters', filters);
      console.log('params 1', params);
      
      
      if (filters.account) params.account = filters.account
      


      if (filters.dateFrom) params['transaction__date__gte'] = filters.dateFrom
      if (filters.dateTo) params['transaction__date__lte'] = filters.dateTo
      console.log('params 2', params);

      const res = await myAxios.get('/entries/', { params })
      setEntries(res.data)
      

      const totalDebit = res.data.reduce((sum, e) => sum + parseFloat(e.debit), 0)
      const totalCredit = res.data.reduce((sum, e) => sum + parseFloat(e.credit), 0)
      setTotals({ debit: totalDebit, credit: totalCredit })

    } catch (err) {
      console.error('Ошибка загрузки проводок:', err)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Отчёт по счетам</h2>

      {/* Фильтры */}
      <div className="flex gap-4 mb-4">
        <div>
          <label>Счёт:</label>
          <select name="account" value={filters.account} onChange={handleFilterChange} className="border p-1">
            <option value="">Все</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.number} — {acc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Дата от:</label>
          <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="border p-1" />
        </div>
        <div>
          <label>Дата до:</label>
          <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="border p-1" />
        </div>
        <button onClick={fetchEntries} className="bg-blue-500 text-white px-3 py-1 rounded">
          Применить
        </button>
      </div>

      {/* Таблица отчёта */}
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Дата</th>
            <th className="p-2 border">Описание</th>
            <th className="p-2 border">Дебет</th>
            <th className="p-2 border">Кредит</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td className="p-2 border">{new Date(entry.transaction_obj.date).toLocaleDateString()}</td>
              <td className="p-2 border">{entry.transaction_obj.description}</td>
              <td className="p-2 border">{entry.debit > 0 ? entry.debit : ''}</td>
              <td className="p-2 border">{entry.credit > 0 ? entry.credit : ''}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="font-bold bg-gray-100">
          <tr>
            <td colSpan={2} className="p-2 border text-right">Итого:</td>
            <td className="p-2 border">{totals.debit.toFixed(2)}</td>
            <td className="p-2 border">{totals.credit.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default AccountReports
