import { http, HttpResponse } from "msw"

export const handlers = [
  http.get("/users", () => {
    return HttpResponse.json({
      data: [
        {
          id: "1",
          name: "Gustavo",
          email: "gustavo@email.com",
          role: "ADMIN",
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    })
  }),
]
