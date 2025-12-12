import React,{ useState } from 'react';
import { Home, CreditCard, Receipt, Bell, Gift, DollarSign, TrendingUp, TrendingDown, Calendar, Search, ChevronRight, Plus, ArrowUpRight, ArrowDownRight, Building2, User, Settings, LogOut, PieChart, Wallet } from 'lucide-react';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const accounts = [
    { name: 'Savings Account', balance: 8450.00, type: 'Savings', color: 'blue' },
    { name: 'Checking Account', balance: 4200.50, type: 'Checking', color: 'green' },
    { name: 'Credit Card', balance: -1250.00, type: 'Credit', color: 'red' }
  ];

  const transactions = [
    { name: 'Grocery Store', amount: -85.50, date: 'Today', category: 'Food', type: 'expense' },
    { name: 'Salary Deposit', amount: 5000.00, date: 'Today', category: 'Income', type: 'income' },
    { name: 'Electric Bill', amount: -120.00, date: 'Yesterday', category: 'Bills', type: 'expense' },
    { name: 'Coffee Shop', amount: -12.50, date: 'Yesterday', category: 'Food', type: 'expense' },
    { name: 'Amazon Purchase', amount: -245.00, date: '2 days ago', category: 'Shopping', type: 'expense' },
    { name: 'Gas Station', amount: -65.00, date: '2 days ago', category: 'Transport', type: 'expense' }
  ];

  const budgets = [
    { category: 'Food', spent: 450, limit: 600, color: 'blue' },
    { category: 'Shopping', spent: 380, limit: 500, color: 'purple' },
    { category: 'Transport', spent: 180, limit: 200, color: 'yellow' },
    { category: 'Bills', spent: 520, limit: 600, color: 'red' }
  ];

  const bills = [
    { name: 'Netflix Subscription', amount: 15.99, dueDate: 'Dec 15', status: 'upcoming', auto: true },
    { name: 'Internet Bill', amount: 89.99, dueDate: 'Dec 18', status: 'upcoming', auto: false },
    { name: 'Phone Bill', amount: 45.00, dueDate: 'Dec 20', status: 'upcoming', auto: true },
    { name: 'Rent Payment', amount: 1500.00, dueDate: 'Dec 25', status: 'pending', auto: false }
  ];

  const rewards = [
    { name: 'Cashback Earned', amount: 45.50, month: 'November' },
    { name: 'Points Balance', amount: 2450, type: 'points' },
    { name: 'Next Reward', needed: 550, unlock: '$50 Voucher' }
  ];

  const currencies = [
    { from: 'USD', to: 'EUR', rate: 0.92, amount: 1000 },
    { from: 'USD', to: 'GBP', rate: 0.79, amount: 500 },
    { from: 'USD', to: 'INR', rate: 83.12, amount: 2000 }
  ];

  const MenuItem = ({ icon: Icon, label, page }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        activePage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'}
  bg-white/60 backdrop-blur-xl shadow-xl border-r border-white/40 transition-all`}>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && <span className="text-xl font-bold text-blue-600">Tivra Bank</span>}
          </div>

          <nav className="space-y-2">
            <MenuItem icon={Home} label="Home" page="Home" />
            <MenuItem icon={CreditCard} label="Accounts" page="accounts" />
            <MenuItem icon={Receipt} label="Transactions" page="transactions" />
            <MenuItem icon={PieChart} label="Budget" page="budget" />
            <MenuItem icon={Bell} label="Bills" page="bills" />
            <MenuItem icon={Gift} label="Rewards" page="rewards" />
            <MenuItem icon={DollarSign} label="Currency" page="currency" />
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            {sidebarOpen && (
              <div>
                <div className="font-medium text-sm">John Doe</div>
                <div className="text-xs text-gray-500">john@email.com</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-red-600">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        
        <header className="bg-white border-b px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activePage === 'Home' && 'Home'}
                {activePage === 'accounts' && 'My Accounts'}
                {activePage === 'transactions' && 'Transactions'}
                {activePage === 'budget' && 'Budget Manager'}
                {activePage === 'bills' && 'Bills & Payments'}
                {activePage === 'rewards' && 'Rewards & Cashback'}
                {activePage === 'currency' && 'Currency Exchange'}
              </h1>
              <p className="text-sm text-gray-500">Welcome back, John!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
              </div>
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          
          {activePage === 'Home' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                  <div className="text-sm opacity-90 mb-2">Total Balance</div>
                  <div className="text-3xl font-bold mb-4">$11,400.50</div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12.5% from last month</span>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="text-sm text-gray-500 mb-2">Monthly Income</div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$5,000.00</div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Salary deposited</span>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="text-sm text-gray-500 mb-2">Monthly Expenses</div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$2,245.50</div>
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>-15% vs last month</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Recent Transactions</h2>
                    <button className="text-blue-600 text-sm font-medium">View All</button>
                  </div>
                  <div className="space-y-4">
                    {transactions.slice(0, 4).map((tx, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {tx.type === 'income' ? 
                              <ArrowUpRight className="w-5 h-5 text-green-600" /> :
                              <ArrowDownRight className="w-5 h-5 text-red-600" />
                            }
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{tx.name}</div>
                            <div className="text-sm text-gray-500">{tx.date}</div>
                          </div>
                        </div>
                        <div className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.type === 'income' ? '+' : ''}{tx.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Budget Overview</h2>
                    <button className="text-blue-600 text-sm font-medium">Manage</button>
                  </div>
                  <div className="space-y-4">
                    {budgets.map((budget, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{budget.category}</span>
                          <span className="text-sm text-gray-500">${budget.spent} / ${budget.limit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-${budget.color}-500`}
                            style={{ width: `${(budget.spent / budget.limit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'accounts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">All Accounts</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Account
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {accounts.map((account, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border-2 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{account.type}</div>
                        <div className="font-bold text-gray-900">{account.name}</div>
                      </div>
                      <Wallet className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className={`text-3xl font-bold mb-4 ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      ${Math.abs(account.balance).toFixed(2)}
                    </div>
                    <button className="w-full py-2 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'transactions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Transaction History</h2>
                <button className="px-4 py-2 border-2 border-gray-200 rounded-lg font-medium">
                  Filter
                </button>
              </div>
              <div className="bg-white rounded-xl border-2">
                {transactions.map((tx, i) => (
                  <div key={i} className="p-4 border-b last:border-b-0 flex justify-between items-center hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {tx.type === 'income' ? 
                          <ArrowUpRight className="w-6 h-6 text-green-600" /> :
                          <ArrowDownRight className="w-6 h-6 text-red-600" />
                        }
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{tx.name}</div>
                        <div className="text-sm text-gray-500">{tx.category} • {tx.date}</div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'budget' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Monthly Budget</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {budgets.map((budget, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">{budget.category}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        budget.spent / budget.limit > 0.9 ? 'bg-red-100 text-red-600' :
                        budget.spent / budget.limit > 0.7 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {((budget.spent / budget.limit) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Spent</span>
                        <span className="font-bold">${budget.spent}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-blue-500"
                          style={{ width: `${(budget.spent / budget.limit) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-500">Remaining</span>
                        <span className="font-bold text-green-600">${budget.limit - budget.spent}</span>
                      </div>
                    </div>
                    <button className="w-full py-2 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50">
                      Adjust Budget
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'bills' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Upcoming Bills</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Bill
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {bills.map((bill, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border-2 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{bill.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Due: {bill.dueDate}
                        </div>
                      </div>
                      {bill.auto && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                          Auto-pay
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      ${bill.amount.toFixed(2)}
                    </div>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                      Pay Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'rewards' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-2">Your Rewards</h2>
                <p className="opacity-90">Keep earning and unlock amazing benefits</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {rewards.map((reward, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border-2">
                    <Gift className="w-12 h-12 text-purple-600 mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">{reward.name}</h3>
                    {reward.type === 'points' ? (
                      <div className="text-3xl font-bold text-purple-600">{reward.amount}</div>
                    ) : reward.unlock ? (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">{reward.needed} points needed</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div className="w-3/4 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                        <div className="text-sm font-medium text-purple-600">{reward.unlock}</div>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-green-600">${reward.amount}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'currency' && (
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Currency Converter</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <input type="number" placeholder="Amount" className="w-full p-3 border-2 rounded-lg mb-2" />
                    <select className="w-full p-3 border-2 rounded-lg">
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <input type="number" placeholder="Amount" className="w-full p-3 border-2 rounded-lg mb-2" />
                    <select className="w-full p-3 border-2 rounded-lg">
                      <option>EUR - Euro</option>
                      <option>USD - US Dollar</option>
                      <option>INR - Indian Rupee</option>
                    </select>
                  </div>
                </div>
                <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium">
                  Convert
                </button>
              </div>

              <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Exchange Rates</h2>
                <div className="space-y-4">
                  {currencies.map((curr, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-bold">{curr.from} → {curr.to}</div>
                        <div className="text-sm text-gray-500">Rate: {curr.rate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${curr.amount}</div>
                        <div className="text-sm text-gray-500">= {(curr.amount * curr.rate).toFixed(2)} {curr.to}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}