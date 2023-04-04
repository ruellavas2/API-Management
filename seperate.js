
// due date set to today for projects
db.projects.aggregate([
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "project_id",
        as: "tasks"
      }
    },
    {
      $match: {
        "tasks.due_date": new Date()
      }
    }
  ])
  
  //due date set for today for task
  db.tasks.aggregate([
    // Join with the projects collection on the project_id field
    {
      $lookup: {
        from: "projects",
        localField: "project_id",
        foreignField: "_id",
        as: "project"
      }
    },
    // Unwind the project array to get individual project documents
    { $unwind: "$project" },
    // Match tasks that have a due date of today
    {
      $match: {
        "project.due_date": new Date().toISOString().slice(0, 10)
      }
    }
  ])
  