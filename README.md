# 小鼠管理系统

一个基于 Next.js 16 和 Prisma 的小鼠管理 Web 应用，支持实验室管理、品系管理、笼位管理等功能。

## 功能特性

- **用户认证**：邮箱密码登录系统
- **实验室管理**：支持多个实验室及成员管理
- **品系管理**：小鼠品系的增删改查
- **笼位管理**：笼位信息管理
- **小鼠管理**：小鼠信息管理（性别、数量、基因型、出生日期等）
- **Excel导入**：支持从Excel文件批量导入数据

## 技术栈

- **前端**: Next.js 16 (App Router)
- **后端**: Next.js API Routes
- **数据库**: SQLite (Prisma ORM)
- **样式**: Tailwind CSS
- **认证**: bcryptjs

## 环境配置

创建 `.env.local` 文件：

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
```

## 本地开发

```bash
npm install
npx prisma generate
npm run db:seed
npm run dev
```

## Vercel 部署

此项目已配置为可在 Vercel 上一键部署。

## 管理员账户

- **邮箱**: admin@lab.com
- **密码**: admin123

## API 接口

- `POST /api/auth/login` - 用户登录
- `GET /api/strains` - 获取品系列表
- `GET /api/strains/:id` - 获取品系详情
- `POST /api/strains` - 创建品系
- `PUT /api/strains/:id` - 更新品系
- `DELETE /api/strains/:id` - 删除品系
- `POST /api/cages` - 创建笼位
- `PUT /api/cages/:id` - 更新笼位
- `DELETE /api/cages/:id` - 删除笼位
- `POST /api/mice` - 创建小鼠
- `PUT /api/mice/:id` - 更新小鼠
- `DELETE /api/mice/:id` - 删除小鼠

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/mouse-management-system)

---

© 2025 实验室小鼠管理系统