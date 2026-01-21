'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

interface Mouse {
  id: string
  sex: string
  quantity: number
  genotype: string | null
  dob: string | null
  notes: string | null
}

interface Cage {
  id: string
  cageNumber: string
  groupId: string | null
  matingDate: string | null
  notes: string | null
  mice: Mouse[]
}

interface Strain {
  id: string
  name: string
  cages: Cage[]
}

function calculateAge(dob: string | null): string {
  if (!dob) return '-'
  const birth = new Date(dob)
  const today = new Date()
  const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return '未出生'
  if (days < 7) return `${days}天`
  if (days < 30) return `${Math.floor(days / 7)}周`
  return `${Math.floor(days / 30)}月`
}

function getSexIcon(sex: string) {
  switch (sex) {
    case 'MALE': return { icon: '♂', color: 'text-blue-600 bg-blue-50' }
    case 'FEMALE': return { icon: '♀', color: 'text-pink-600 bg-pink-50' }
    default: return { icon: '?', color: 'text-gray-600 bg-gray-50' }
  }
}

export default function StrainDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [strain, setStrain] = useState<Strain | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddCage, setShowAddCage] = useState(false)
  const [showAddMouse, setShowAddMouse] = useState<string | null>(null)

  // Cage form
  const [cageNumber, setCageNumber] = useState('')
  const [groupId, setGroupId] = useState('')
  const [matingDate, setMatingDate] = useState('')
  const [cageNotes, setCageNotes] = useState('')

  // Mouse form
  const [mouseSex, setMouseSex] = useState('UNKNOWN')
  const [mouseQty, setMouseQty] = useState('1')
  const [mouseGenotype, setMouseGenotype] = useState('')
  const [mouseDob, setMouseDob] = useState('')
  const [mouseNotes, setMouseNotes] = useState('')

  useEffect(() => {
    fetchStrain()
  }, [resolvedParams.id])

  const fetchStrain = async () => {
    try {
      const res = await fetch(`/api/strains/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setStrain(data)
      }
    } catch (error) {
      console.error('Failed to fetch strain:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCage = async () => {
    if (!cageNumber.trim()) return
    try {
      const res = await fetch(`/api/strains/${resolvedParams.id}/cages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cageNumber: cageNumber.trim(),
          groupId: groupId.trim() || null,
          matingDate: matingDate || null,
          notes: cageNotes.trim() || null
        })
      })
      if (res.ok) {
        setCageNumber('')
        setGroupId('')
        setMatingDate('')
        setCageNotes('')
        setShowAddCage(false)
        fetchStrain()
      }
    } catch (error) {
      console.error('Failed to add cage:', error)
    }
  }

  const handleAddMouse = async (cageId: string) => {
    try {
      const res = await fetch(`/api/cages/${cageId}/mice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sex: mouseSex,
          quantity: parseInt(mouseQty) || 1,
          genotype: mouseGenotype.trim() || null,
          dob: mouseDob || null,
          notes: mouseNotes.trim() || null
        })
      })
      if (res.ok) {
        setMouseSex('UNKNOWN')
        setMouseQty('1')
        setMouseGenotype('')
        setMouseDob('')
        setMouseNotes('')
        setShowAddMouse(null)
        fetchStrain()
      }
    } catch (error) {
      console.error('Failed to add mouse:', error)
    }
  }

  const handleDeleteCage = async (cageId: string) => {
    if (!confirm('确定删除此笼位？所有小鼠数据也将被删除。')) return
    try {
      const res = await fetch(`/api/cages/${cageId}`, { method: 'DELETE' })
      if (res.ok) fetchStrain()
    } catch (error) {
      console.error('Failed to delete cage:', error)
    }
  }

  // Stats
  const totalMice = strain?.cages.reduce((sum, c) => sum + c.mice.reduce((s, m) => s + m.quantity, 0), 0) || 0
  const maleCount = strain?.cages.reduce((sum, c) => sum + c.mice.filter(m => m.sex === 'MALE').reduce((s, m) => s + m.quantity, 0), 0) || 0
  const femaleCount = strain?.cages.reduce((sum, c) => sum + c.mice.filter(m => m.sex === 'FEMALE').reduce((s, m) => s + m.quantity, 0), 0) || 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!strain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">品系不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">{strain.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{strain.name}</h1>
                  <p className="text-xs text-gray-500">品系详情</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddCage(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加笼位
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{strain.cages.length}</p>
            <p className="text-sm text-gray-500">笼位数</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{totalMice}</p>
            <p className="text-sm text-gray-500">小鼠总数</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">{maleCount}</p>
            <p className="text-sm text-gray-500">♂ 雄性</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-pink-600">{femaleCount}</p>
            <p className="text-sm text-gray-500">♀ 雌性</p>
          </div>
        </div>

        {/* Cages */}
        {strain.cages.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500">暂无笼位数据，点击"添加笼位"创建</p>
          </div>
        ) : (
          <div className="space-y-4">
            {strain.cages.map((cage) => (
              <div key={cage.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
                      {cage.cageNumber}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">笼位 {cage.cageNumber}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {cage.groupId && <span>编号: {cage.groupId}</span>}
                        {cage.matingDate && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                            配笼: {new Date(cage.matingDate).toLocaleDateString('zh-CN')}
                          </span>
                        )}
                        {cage.notes && <span>{cage.notes}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddMouse(cage.id)}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      添加小鼠
                    </button>
                    <button
                      onClick={() => handleDeleteCage(cage.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50 text-left text-sm text-gray-500">
                        <th className="px-6 py-3 font-medium">性别</th>
                        <th className="px-6 py-3 font-medium">数量</th>
                        <th className="px-6 py-3 font-medium">基因型</th>
                        <th className="px-6 py-3 font-medium">出生日期</th>
                        <th className="px-6 py-3 font-medium">日龄</th>
                        <th className="px-6 py-3 font-medium">备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cage.mice.length > 0 ? cage.mice.map((mouse) => {
                        const sex = getSexIcon(mouse.sex)
                        return (
                          <tr key={mouse.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-lg ${sex.color}`}>
                                {sex.icon}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{mouse.quantity}</td>
                            <td className="px-6 py-4">
                              {mouse.genotype ? (
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-sm">{mouse.genotype}</span>
                              ) : '-'}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {mouse.dob ? new Date(mouse.dob).toLocaleDateString('zh-CN') : '-'}
                            </td>
                            <td className="px-6 py-4 text-gray-600">{calculateAge(mouse.dob)}</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">{mouse.notes || '-'}</td>
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            暂无小鼠数据
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Cage Modal */}
      {showAddCage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">添加笼位</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">笼位编号 *</label>
                  <input
                    type="text"
                    value={cageNumber}
                    onChange={(e) => setCageNumber(e.target.value)}
                    placeholder="如: A1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">总编号</label>
                  <input
                    type="text"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    placeholder="如: 001"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">配笼时间</label>
                <input
                  type="date"
                  value={matingDate}
                  onChange={(e) => setMatingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <input
                  type="text"
                  value={cageNotes}
                  onChange={(e) => setCageNotes(e.target.value)}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowAddCage(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddCage}
                disabled={!cageNumber.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Mouse Modal */}
      {showAddMouse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">添加小鼠</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                  <div className="flex gap-2">
                    {['MALE', 'FEMALE', 'UNKNOWN'].map((sex) => {
                      const info = getSexIcon(sex)
                      return (
                        <button
                          key={sex}
                          type="button"
                          onClick={() => setMouseSex(sex)}
                          className={`flex-1 py-2 rounded-xl border-2 text-lg transition-colors ${
                            mouseSex === sex ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          {info.icon}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                  <input
                    type="number"
                    min="1"
                    value={mouseQty}
                    onChange={(e) => setMouseQty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">基因型</label>
                  <input
                    type="text"
                    value={mouseGenotype}
                    onChange={(e) => setMouseGenotype(e.target.value)}
                    placeholder="如: +/+, +/-"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出生日期</label>
                  <input
                    type="date"
                    value={mouseDob}
                    onChange={(e) => setMouseDob(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <input
                  type="text"
                  value={mouseNotes}
                  onChange={(e) => setMouseNotes(e.target.value)}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowAddMouse(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleAddMouse(showAddMouse)}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
